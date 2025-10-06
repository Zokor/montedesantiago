# Dockerfile for combined Nginx + PHP-FPM (multi-service container)
FROM php:8.4-fpm

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    nginx \
    libpng-dev \
    libjpeg-dev \
    libpq-dev \
    libwebp-dev \
    zip \
    unzip \
    libzip-dev \
    cron \
    supervisor && \
    docker-php-ext-configure gd --with-jpeg --with-webp && \
    docker-php-ext-install gd pdo pdo_mysql pdo_pgsql opcache zip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /usr/share/doc/*

# Ensure session directory exists and is writable
RUN mkdir -p /var/lib/php/sessions && \
    chmod -R 777 /var/lib/php/sessions && \
    echo "session.save_path = /var/lib/php/sessions" > /usr/local/etc/php/conf.d/session.ini

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Set ownership of webroot to www-data user
RUN chown www-data:www-data /var/log/nginx/
RUN chown www-data:www-data /var/www/html/

# Copy Nginx config
COPY dockerfiles/custom-nginx.conf /etc/nginx/conf.d/custom-nginx.conf

# Copy custom PHP config
COPY dockerfiles/custom-php.ini /usr/local/etc/php/conf.d/custom-php.ini

# Copy cron job file
#COPY dockerfiles/app-cron /etc/cron.d/app-cron
#RUN chmod 0644 /etc/cron.d/app-cron

RUN rm -f /etc/nginx/sites-enabled/default

# Copy entrypoint script
COPY dockerfiles/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy supervisor config
COPY dockerfiles/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose ports
EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]