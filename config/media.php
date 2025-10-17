<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Media Storage
    |--------------------------------------------------------------------------
    |
    | Determines whether media uploads are stored on the local filesystem or
    | an S3 compatible disk. Supported options: "local", "s3".
    |
    */

    'storage' => env('MEDIA_STORAGE', 'local'),

    /*
    |--------------------------------------------------------------------------
    | Disk Mapping
    |--------------------------------------------------------------------------
    |
    | Map the logical "local" or "s3" storage options to filesystem disks
    | defined in config/filesystems.php.
    |
    */

    'disks' => [
        'local' => env('MEDIA_LOCAL_DISK', 'media_local'),
        's3' => env('MEDIA_S3_DISK', 's3'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Folders
    |--------------------------------------------------------------------------
    |
    | The base folders for full-size assets and generated thumbnails.
    |
    */

    'directories' => [
        'base' => env('MEDIA_DEFAULT_FOLDER', 'media'),
        'thumbnails' => env('MEDIA_THUMBNAIL_FOLDER', 'media/thumbnails'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Upload Constraints
    |--------------------------------------------------------------------------
    |
    | Global upload constraints including maximum size (in kilobytes) along
    | with image optimisation parameters.
    |
    */

    'max_upload_size' => (int) env('MEDIA_MAX_UPLOAD_SIZE', 20480), // 20 MB

    'image' => [
        'quality' => (int) env('MEDIA_IMAGE_QUALITY', 82),
        'max_width' => (int) env('MEDIA_IMAGE_MAX_WIDTH', 3840),
        'max_height' => (int) env('MEDIA_IMAGE_MAX_HEIGHT', 3840),
        'thumbnail_width' => (int) env('MEDIA_THUMBNAIL_WIDTH', 480),
        'thumbnail_height' => (int) env('MEDIA_THUMBNAIL_HEIGHT', 480),
    ],

];
