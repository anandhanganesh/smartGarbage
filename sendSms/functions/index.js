const functions = require('firebase-functions');
const admin=require('firebase-admin');
admin.initializeApp(functions.config().firestore);
const twilio=require('twilio');
const aSid=functions.config().twilio.sid;
const aToken=functions.config().twilio.token;
const aPhone=functions.config().twilio.phone;
const client=new twilio(aSid,aToken);
const db=admin.firestore();

var getWorkerInfo=function(area){
return new Promise((resolve,reject)=>{
	db.collection('workers').where("working_area","==",area).get().then(document=>{		
		const ddata=document.data();
			   return resolve(ddata['phone']);
        	}).catch((error)=>{
        		return reject(error);
						});

		});
      }

exports.sendSms=functions.firestore.document("garbages/{id}").onWrite((change,context)=>{
		const data=change.after.data();
		const area=data['area'];
		return getWorkerInfo(area).then((phone)=>{
			if(data['filled']>=90){
  			return client.messages
			  .create({
			     body: 'the garbage bin placed in the '+data['area']+' is filled, please clean the bin and restart the machine',
			     from: aPhone,																																																																				
			     to: '+91'+phone
			   })
			  .then((message) => {
			  	console.log(message.sid);
			  	return Promise.resolve(0);
			  }.catch((error)=>{console.log(error);});
			}
			else{
				console.log("Garbage filled level:"+data['filled']);
			}
		});	
});
