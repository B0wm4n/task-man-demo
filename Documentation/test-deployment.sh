#! /bin/bash
#Lets Get IP
echo Please Enter the Ip or Hostname of the server
read hostIP
echo Please Enter the PORT the application was deployed to
read hostPort
clear
echo Running test against http://$hostIP:$hostPort
curlHost=http://$hostIP:$hostPort
echo 
echo Adding record
#Add Record
curl -d '{"title":"Build Monument","description":"Complete construction of world wonder","status":"Pending"}' -H 'Content-Type: application/json' $curlHost/tasks
echo 
echo Please Enter the taskId of the recently created record
read taskid

#Update Record
echo Lets try an update
curl -d '{"title":"Build Monument","description":"Scaled Back Project, create lesser wonder","status":"In Progress"}' -H 'Content-Type: application/json' -X PUT $curlHost/tasks/$taskid

#Display tasks available in Database
echo 
echo Quick Display of the database
curl $curlHost/tasks
#Delete the 1st database record, this is expected to fail on the 2nd run
echo
echo Lets Remove the 1st record
curl -X DELETE $curlHost/tasks/1
echo
echo Completed fast dirty test
