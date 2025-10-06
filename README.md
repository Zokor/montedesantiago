Para criar e update: docker-compose up --build -d

# Monte de Santiago

Initiate Database - docker-compose exec webserver php artisan migrate
docker-compose exec webserver php artisan db:seed
