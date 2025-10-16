<?php

namespace App\Services;

use App\Models\Component;
use App\Models\Page;
use App\Models\PageComponent;
use App\Models\PageVersion;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class VersioningService
{
    public function __construct(
        private readonly int $retainedVersions = 5,
    ) {}

    /**
     * Persist a snapshot of the page.
     */
    public function createVersion(Page $page, ?string $summary = null, ?int $authorId = null): PageVersion
    {
        $page->loadMissing([
            'pageComponents.component',
            'components',
        ]);

        $authorId ??= Auth::id() ?? $page->updated_by ?? $page->created_by;

        return DB::transaction(function () use ($page, $summary, $authorId): PageVersion {
            $version = PageVersion::create([
                'page_id' => $page->getKey(),
                'content' => $this->snapshotPage($page),
                'created_by' => $authorId ?? $page->created_by,
                'change_summary' => $summary,
            ]);

            $this->pruneOldVersions($page);

            return $version;
        });
    }

    /**
     * Restore page to provided version snapshot.
     */
    public function restoreVersion(PageVersion $version): Page
    {
        $page = $version->page()->lockForUpdate()->firstOrFail();

        return DB::transaction(function () use ($page, $version): Page {
            $content = $version->content ?? [];

            $page->fill(Arr::only($content, [
                'title',
                'slug',
                'is_homepage',
                'status',
                'published_at',
            ]));
            $page->save();

            PageComponent::where('page_id', $page->getKey())->delete();

            $components = Arr::get($content, 'components', []);
            foreach ($components as $index => $componentData) {
                $componentId = $this->resolveComponentId($componentData);

                if (! $componentId) {
                    continue;
                }

                PageComponent::create([
                    'page_id' => $page->getKey(),
                    'component_id' => $componentId,
                    'data' => Arr::get($componentData, 'data', []),
                    'order' => Arr::get($componentData, 'order', (int) $index),
                ]);
            }

            $restored = $page->fresh(['pageComponents.component', 'components']);
            $this->createVersion(
                $restored,
                sprintf('Restored from version %d', $version->getKey())
            );

            return $restored;
        });
    }

    /**
     * Compare two versions and return differences.
     *
     * @return array<string, array{from:mixed,to:mixed}>
     */
    public function compareVersions(PageVersion $first, PageVersion $second): array
    {
        $firstContent = Arr::dot($first->content ?? []);
        $secondContent = Arr::dot($second->content ?? []);

        $keys = array_unique([...array_keys($firstContent), ...array_keys($secondContent)]);
        $diff = [];

        foreach ($keys as $key) {
            $from = $firstContent[$key] ?? null;
            $to = $secondContent[$key] ?? null;

            if ($from !== $to) {
                $diff[$key] = [
                    'from' => $from,
                    'to' => $to,
                ];
            }
        }

        return $diff;
    }

    /**
     * Create a serialised page snapshot.
     *
     * @return array<string, mixed>
     */
    private function snapshotPage(Page $page): array
    {
        $page->loadMissing('pageComponents.component');

        return [
            'title' => $page->title,
            'slug' => $page->slug,
            'is_homepage' => $page->is_homepage,
            'status' => $page->status,
            'published_at' => optional($page->published_at)?->toISOString(),
            'components' => $page->pageComponents
                ->sortBy('order')
                ->map(fn (PageComponent $pivot) => [
                    'component_id' => $pivot->component_id,
                    'slug' => $pivot->component?->slug,
                    'data' => $pivot->data,
                    'order' => $pivot->order,
                ])
                ->values()
                ->all(),
        ];
    }

    /**
     * Resolve component id from snapshot entry.
     *
     * @param  array<string, mixed>  $componentData
     */
    private function resolveComponentId(array $componentData): ?int
    {
        $componentId = Arr::get($componentData, 'component_id');
        if ($componentId) {
            return (int) $componentId;
        }

        $slug = Arr::get($componentData, 'slug');
        if ($slug) {
            return Component::query()
                ->where('slug', $slug)
                ->value('id');
        }

        return null;
    }

    /**
     * Remove old versions, keeping the newest N.
     */
    private function pruneOldVersions(Page $page): void
    {
        $versionIds = $page->versions()
            ->latest()
            ->get(['id'])
            ->slice($this->retainedVersions)
            ->pluck('id');

        if ($versionIds->isNotEmpty()) {
            PageVersion::whereIn('id', $versionIds)->delete();
        }
    }
}
