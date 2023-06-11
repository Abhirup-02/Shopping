# Shopping Microservices

### Using Event Sourcing Architecture
![Fire   Forget](https://github.com/Abhirup-02/Shopping/assets/92736753/36e7d778-505c-456d-ad14-b44f24b81530)
The drawback of this architecture is, if one of the service goes down the EVENT created by another Service, which might be needed for the currently down Service 
to process, it will be lost. Which will definitely lead to Service-Rupture.
<br>
<br>
<br>
<hr>
<br>




### All Services are tightly coupled together using Message Broker
![Message Broker](https://github.com/Abhirup-02/Shopping/assets/92736753/3f65bffc-939a-43f3-b1d6-0be3b188ab2c)
Even though if a Service goes down, when it will be available, it will fetch the persisted EVENT from the MESSAGE QUEUE and acknowledge the EVENT. Thus the message will be removed from the queue, reducing Service-Downtime.
