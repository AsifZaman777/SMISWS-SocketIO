### SMISWS with socket io implementation

#### 🔌 Connection Architecture


#### Why we need a bridge server?
- Socket io and plain web socket are not directly compitable
- Plain websocket server can not decode the socket io messages
- Socket io client is socket io server specific
- So basically the bridge server is working as a translator

