<section class="py-12 bg-gray-100">
  <div class="max-w-6xl mx-auto px-4">
    <h2 class="text-3xl font-bold text-center mb-8">Gallery</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      @foreach (['1','2','3','4','5','6','7','8'] as $i)
        <a href="https://picsum.photos/seed/{{ $i }}/1200/800" data-lightbox="gallery">
          <img src="https://picsum.photos/seed/{{ $i }}/400/300" alt="Gallery image {{ $i }}" class="w-full h-48 object-cover rounded">
        </a>
      @endforeach
    </div>
  </div>
</section>
