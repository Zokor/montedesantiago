#!/bin/sh
# Entrypoint for combined Nginx + PHP-FPM + cron
set -e

# Ensure log files exist
mkdir -p /var/log/supervisor

# Checks if composer.json exists before running composer install
# if [ -f "/var/www/html/composer.json" ]; then
#     echo "Running composer install..."
#     composer install --no-ansi --no-interaction --no-dev --optimize-autoloader
# else
#     echo "composer.json not found, skipping composer install."
# fi

chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html

# Start supervisor (which manages nginx, php-fpm, and cron)
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf