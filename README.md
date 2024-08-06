# Rudimentary NodeJS Sample to demo CRUD

The file indexProd.js found in src can be deployed to most any existing NodeJs server and should work.  

The recommended way to deploy this sample would be as a Docker container
This can be accomplished by the command sudo docker compose up --build [-d] from the root directory

The docker container will have an install of SQLite installed as well, it shoul be possible to pop into the container with sudo docker exec -ti [name of container] /bin/sh and manually work with the db file if required

The project was developed in Linx and the test script (See Documentation) runs as a bash script.  it can be executed from the root directory by ./Documentation/test-deployment

By Default the container is going to use port 3000, this can be modified in the Docker File by changing "3000:80" to "####:80"

There is no warrantly with any of the code, expressed or implied.  Use at your risk, you're mileage will vary. 

