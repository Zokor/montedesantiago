<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('media') && ! Schema::hasTable('cms_media')) {
            Schema::rename('media', 'cms_media');
        }

        if (! Schema::hasTable('cms_media')) {
            return;
        }

        if (Schema::hasColumn('cms_media', 'original_filename') && ! Schema::hasColumn('cms_media', 'original_name')) {
            DB::statement('ALTER TABLE cms_media RENAME COLUMN original_filename TO original_name');
        }

        if (Schema::hasColumn('cms_media', 'mime_type') && ! Schema::hasColumn('cms_media', 'type')) {
            DB::statement('ALTER TABLE cms_media RENAME COLUMN mime_type TO type');
        }

        Schema::table('cms_media', function (Blueprint $table) {
            if (! Schema::hasColumn('cms_media', 'url')) {
                $table->string('url', 500)->nullable()->after('path');
            }

            if (! Schema::hasColumn('cms_media', 'width')) {
                $table->unsignedInteger('width')->nullable()->after('size');
            }

            if (! Schema::hasColumn('cms_media', 'height')) {
                $table->unsignedInteger('height')->nullable()->after('width');
            }

            if (! Schema::hasColumn('cms_media', 'tags')) {
                $table->json('tags')->nullable()->after('metadata');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Intentionally left blank: reverting this migration would discard media metadata.
    }
};
