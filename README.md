Para criar e update: docker-compose up --build -d

# Monte de Santiago

Initiate Database - docker-compose exec webserver php artisan migrate
Update Database - docker-compose exec webserver php artisan db:seed

php artisan db:seed
