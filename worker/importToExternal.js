const Queue = require('rethinkdb-job-queue')
// const func = require('./function')
const app = require('config')
var axios = require('axios');
let async = require('asyncawait/async');
let await = require('asyncawait/await');
const cxnOptions = app.get('rethinkdb')
var pino = require('pino');
var mongodb = require('mongodb');
var elasticsearch = require('elasticsearch');
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');
var path = require('path');
// var aurl = 'http://' + job.configData.host + ':' + job.configData.port;
var endecrypt = require('../service/src/services/encryption/security')			
var mysql = require('mysql');
var _ = require('lodash')

console.log('importToExternal Worker Started.....')
const qOptions = app.get('qOptions1')
const q = new Queue(cxnOptions, qOptions)

var createConn = async (function(data, mapdata) {
	if(data.selectedDb == 'mongo') {
		var conn = await (MongoClient.connect('mongodb://' + data.host + ':' + data.port + '/' + data.dbname))
		return {conn: conn, db: data.selectedDb}
	} else if(data.selectedDb == 'rethink') {
		console.log('rethink........................')
		var r = require('rethinkdbdash')({
		  username: data.username,
          password: data.password,
	      port: data.port,
	      host: data.host,
	      db: data.dbname
	    })
	    if (mapdata != undefined) {
	    	for (let [i, mObj] of mapdata.entries() ) {
	    		// console.log(mObj.target)
	    		var existTable = await (r.tableList().contains(mObj.target))
	    		if(!existTable) {
	    			var createTable = await (r.tableCreate(mObj.target)) 
	    		}
	    		console.log('existTable ' + mObj.target + ' ==> ' + existTable)
	    	}
	    }
	    return {conn: r, db: data.selectedDb}
	} else if(data.selectedDb == 'elastic') {
		 var client = await (new elasticsearch.Client({
	        host: data.host + ':' + data.port
	      }).ping({
	        requestTimeout: 1000
	      }))
      // console.log(client)
    	return {conn: client, db: data.selectedDb}
	} else if(data.selectedDb == 'mysql') {
		// console.log('-----------import ------------',data);
		var pass = endecrypt.decrypt(data.password)

		var connection = mysql.createConnection({
			host     : data.host,
			port     : data.port,
			user     : data.username,
			password : pass,
			database : data.dbname
		});
		connection.connect();
		
		if (mapdata != undefined) {
	    	for (let [i, mObj] of mapdata.entries() ) {
				var tableData = function () {
					var result = []
					
					return new Promise((resolve, reject) => {
						connection.query("SHOW TABLES LIKE '"+mObj.target+"'", function (error, result, fields) {
						error? reject(error) : resolve(result.length)
					  })
					}).then(content => {
					  return content;
					}).catch(err=> {
					  return err;
					})     
				};
	  			var resTableData = await (tableData())
				  var getDatabaseTables = await(getQuery('mysql','select','commonSelect'));
				getDatabaseTables = getDatabaseTables.replace('{{ table_name }}',mObj.target+ ' LIMIT 1');
				getDatabaseTables = getDatabaseTables.replace('{{ fields }}','1');

				if(resTableData == 0)
				{
					var checkColumn = await(getQuery('mysql','create','createTable'));
					checkColumn = checkColumn.replace('{{ table_name }}',mObj.target);
					checkColumn = checkColumn.replace('{{ fields }}','id text NOT NULL');
	
					connection.query(checkColumn);
	
					var checkColumn = await(getQuery('mysql','alter','changeFieldType'));
					checkColumn = checkColumn.replace('{{ table_name }}',mObj.target);
					checkColumn = checkColumn.replace('{{ field }}','id');
					checkColumn = checkColumn.replace('{{ field1 }}','id');
					checkColumn = checkColumn.replace('{{ fieldType }}','INT(11) NOT NULL');
					
					connection.query(checkColumn);
					
					var checkColumn = await(getQuery('mysql','alter','addPrimaryKey'));
					checkColumn = checkColumn.replace('{{ table_name }}',mObj.target);
					checkColumn = checkColumn.replace('{{ field }}','id');
					
					connection.query(checkColumn);
					
					var checkColumn = await(getQuery('mysql','alter','changeFieldType'));
					checkColumn = checkColumn.replace('{{ table_name }}',mObj.target);
					checkColumn = checkColumn.replace('{{ field }}','id');
					checkColumn = checkColumn.replace('{{ field1 }}','id');
					checkColumn = checkColumn.replace('{{ fieldType }}','INT(11) NOT NULL AUTO_INCREMENT');
					
					connection.query(checkColumn);
							
				}
				
			}
		}
		return {conn: connection, db: data.selectedDb}

	}
})
var getSchemaidByName = async (function(url, name) {
	var _resi = await (axios.get(url +'/schema'))
	var schema = _resi.data
	for(let [i, obj] of schema.entries()) {
		if(obj.title == name) {
			return obj._id
		}
	}
})

var updateSchema = async( function(data,table_name,databse_name,conn) {
	var tableFields='';
	var tableValues='';
	k=0;
	
	_.forEach(data, function (d,key) {
        // if(key != 'Schemaid' && key != 'id' && key != '_id')
		if(key != 'id' && key != '_id')
        {
          if(k==0)
          {
            let res = await (UUID())
            let uuid = res;

            tableFields += key;
            

            if(typeof d == 'object')
              {
                tableValues += "'"+JSON.stringify(d)+"'";
              }
              else{
                tableValues += "'"+d+"'";
              }
              
          }
          else
          {
            if(typeof d == 'object')
            {
              tableFields += ','+key;
              tableValues += ",'"+JSON.stringify(d)+"'";              
            }
            else{
              tableFields += ','+key;
              tableValues += ",'"+d+"'";              
            }
          }
          k++; 
        }
	  })
	  
	  var columns = tableFields.split(",");
	  
	  var updateSchemaData = async(function () {
        var promises = []        
        new_fields=[]
    
        _.forEach(columns, function (entity,index) {
  
          if(entity != 'id' && entity != '_id')
          {
            var checkColumn = await(getQuery('mysql','select','checkColumn'));
            checkColumn = checkColumn.replace('{{ table_name }}','information_schema.COLUMNS');
            checkColumn = checkColumn.replace('{{ tableName }}',table_name);
            checkColumn = checkColumn.replace('{{ fields }}','*');
            checkColumn = checkColumn.replace('{{ database_name }}',databse_name);
            checkColumn = checkColumn.replace('{{ column_name }}',entity.replace(' ', '_'));
			
            var process = new Promise((resolve, reject) => {
				conn.conn.query(checkColumn, function (error, result, fields) {
                error? reject(error) : result.length == 0 ? resolve(entity.replace(' ', '_')) : resolve('')
              })
            })    
          }
  
          promises.push(process); 
        });
      
        return Promise.all(promises).then(content => {
          return _.union(content)
        });
      })
  
	  var updateSchemaDataResponse = await (updateSchemaData())
	  
	  _.forEach(updateSchemaDataResponse, function (field,index) {
			if(field != "")
			{
			var alterTableAndAddField = await(getQuery('mysql','alter','alterTableAndAddField'));
			alterTableAndAddField = alterTableAndAddField.replace('{{ table_name }}',table_name);
			alterTableAndAddField = alterTableAndAddField.replace('{{ field }}',field);
			alterTableAndAddField = alterTableAndAddField.replace('{{ type }}','TEXT NULL DEFAULT NULL');
			alterTableAndAddField = alterTableAndAddField.replace('{{ after }}','');

			conn.conn.query(alterTableAndAddField);
			}
		})
		
		var commonInsert = await(getQuery('mysql','insert','commonInsert'));
		commonInsert = commonInsert.replace('{{ table_name }}',table_name);
		commonInsert = commonInsert.replace('{{ fields }}',tableFields);
		commonInsert = commonInsert.replace('{{ values }}',tableValues);
		conn.conn.query(commonInsert);

    return "success";
})

var getQuery = async(function (dbName,type,queryFor) {
  let result = new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, '../service/src/services/DBConnection/query.json'),function (err, data) {
	  if (err) return console.log(err);
	  
          resolve(JSON.parse(data));
          });
    });

    var _data = Promise.resolve(result).then(function(dbdata){
        var instance;

        _.forEach(dbdata[dbName][type], function(instances, db){
            if(Object.keys(instances)[0] == queryFor)
            {
              var obj = _.find(instances)
              if(obj != undefined){
                instance = obj
              }
            }   
        })
        return instance
    });
    return _data
});

var UUID = async(function generateUUID() {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c=='x' ? r : (r&0x3|0x8)).toString(16);
	});
	return uuid;
});

var filterObj = async (function(mobj, fArr) {
	var fobj = {}
	for( let [i, obj] of fArr.entries()) {
		for(let k in mobj) {
			if(k == obj.name) {
				if(obj.input != "") {
				// console.log(k, ' == ', obj.input)
					fobj[obj.input] = mobj[k]
				} else {
					fobj[k] = mobj[k]
				}
			}
		}
	}
	// console.log('\n >>> ', fobj)
	// if(mobj.hasOwnProperty('Schemaid'))
	return fobj
})

q.process(async(job, next) => {
	try {
			console.log('job.data\n ', JSON.stringify(job.data))
			var aurl = 'http://' + job.configData.host + ':' + job.configData.port;
			var res = []
			var instance = []
			// var _resi = await (axios.get('http://'+job.configData.host+':'+job.configData.port+'/'))
			var sConn = await (createConn(job.data.source));
			var tConn = await (createConn(job.data.target, job.data.mapdata));
			// console.log(sConn, '>>>>>>>>>>>', tConn)
			// console.log('11111111111111111111111111111111111111')
			// var _res = await (sConn.conn.table('address_line').run())
			// var _res = await (tConn.conn.collection('asd').find().toArray())
			// console.log('22222222222222222222222222222222222222')
			// console.log('_res', _res)
			for (let [i, obj] of job.data.mapdata.entries() ) {
				// console.log(obj, i)
				var sData = []
				var tData = [] 
				if(obj.target == '') {
					obj.target = obj.source
				}

					// for Getting Source Data
					if(job.data.source.selectedDb == 'mongo') {
						sData = await (sConn.conn.collection(obj.source).find().toArray())
					} else if(job.data.source.selectedDb == 'rethink') {
						// console.log('11111111111111111111111111', obj.source)
						sData = await (sConn.conn.table(obj.source).run())
						// console.log('2222222222222222222222222', sData)
					} else if(job.data.source.selectedDb == 'elastic') {
						var _res = await (sConn.conn.search({
					        index: job.data.source.dbname,
					        type: obj.source,
					        body: {
					            query: {
					                match_all: { }
					            },
					        }
					    }))
						_res.hits.hits.forEach(function(hit){
					        var item =  hit._source;
					        item._id = hit._id;
					        sData.push(item);
					    })
					} else if(job.data.source.selectedDb == 'mysql') {
						var getDatabaseTables = await(getQuery('mysql','select','commonSelect'));
						getDatabaseTables = getDatabaseTables.replace('{{ table_name }}',obj.source);
						getDatabaseTables = getDatabaseTables.replace('{{ fields }}','*');

						var tableList = function () {
						  var result = []
						  
						  return new Promise((resolve, reject) => {
							sConn.conn.query(getDatabaseTables, function (error, result, fields) {
							  error? reject(error) : resolve(result)
							})
						  }).then(content => {
							return content;
						  }).catch(err=> {
							return err;
						  })     
						};
						var resTableList = await (tableList())
						console.log('resTableList',resTableList)
						for (let [i, sObj] of resTableList.entries()) {
							instanceVal = {};         
							
							_.forEach(sObj, function (rs1,key) {
								  instanceVal[key] = rs1;                        
							})
							
							sData.push(instanceVal);							
						}
							
					}
					// console.log('sData',sData);
					// console.log('job.data.target.selectedDb',job.data.target.selectedDb);
					// inserting source data into target table
					if(job.data.target.selectedDb == 'mongo') {
						var _res = []
						// var sId = await (getSchemaidByName(aurl, obj.target))
						for (let [i, sObj] of sData.entries()) {
							// sObj._id = sObj._id
							// delete sObj.id
							// if(sObj.hasOwnProperty('Schemaid')) {
							// 	sObj.Schemaid = sId
							// }
							if (obj.colsData.length !== 0) {
								sObj = await (filterObj(sObj, obj.colsData))
							}
							var s = await (tConn.conn.collection(obj.target).insert(sObj))
							_res.push(s)
						}
						// await (sConn.conn.collection(obj.source).find().toArray())
					} else if(job.data.target.selectedDb == 'rethink') {
						var _res = []
						// var sId = await (getSchemaidByName(aurl, obj.target))
						// console.log(sData)
						for (let [i, sObj] of sData.entries()) {
							if(sObj.hasOwnProperty('_id')) {
								sObj.id = (sObj._id).toString()
								sObj._id = sObj.id
							}

							if (obj.colsData.length !== 0) {
								sObj = await (filterObj(sObj, obj.colsData))
							} 
							// console.log('>>>>> ', sObj)
							var s = await (tConn.conn.table(obj.target).insert(sObj).run())
							_res.push(s)		
						} 		
						// for (let [i, sObj] of sData.entries()) {
							
						// 	if(sObj.hasOwnProperty('_id')) {
						// 		sObj.id = (sObj._id).toString()
						// 		sObj._id = sObj.id
						// 	}
						// 	// else{
						// 	// 	let uuid = await (UUID())
						// 	// 	sObj._id = uuid
						// 	// 	sObj.id = uuid
						// 	// }
							
						// 	// if(sObj.hasOwnProperty('Schemaid')) {
						// 	// 	sObj.Schemaid = sId
						// 	// 	// console.log(sObj.Schemaid)
						// 	// }
						// 	// console.log('sObj',sObj)
							
						// 	var s = await (tConn.conn.table(obj.target).insert(sObj).run())
						// 	_res.push(s)
						// }
						// console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', _res)

					} else if(job.data.target.selectedDb == 'elastic') {
						var _res = []
						// var sId = await (getSchemaidByName(aurl, obj.target))
						for (let [i, sObj] of sData.entries()) {
							sObj._id = (sObj._id).toString()
							// delete sObj.id
							// if(sObj.hasOwnProperty('Schemaid')) {
							// 	sObj.Schemaid = sId
							// }
							if (obj.colsData.length !== 0) {
								sObj = await (filterObj(sObj, obj.colsData))
							}
							var s = await (tConn.conn.index({
						        index: job.data.target.dbname,
						        type: obj.target,
						        body: sObj
						    }))
							_res.push(s)
						}
					} else if(job.data.target.selectedDb == 'mysql') {
						var _res = []
						
						// if(sObj.hasOwnProperty('_id')) {
						// 	sObj.id = (sObj._id).toString()
						// 	sObj._id = sObj.id
						// }
						
						// var sId = await (getSchemaidByName(aurl, obj.target))
						
						for (let [i, sObj] of sData.entries()) {
							if (obj.colsData.length !== 0) {
								sObj = await (filterObj(sObj, obj.colsData))
							}
							
							// console.log('sObj',sObj,obj.target,job.data.target.dbname)
							// return false;
							// sObj.Schemaid = sId
							var response = await (updateSchema(sObj, obj.target,job.data.target.dbname,tConn))
						}
					}
			}

			console.log('-----------------------||  Done  ||------------------------')
		return next(null, 'success')
	} catch (err) {
		pino().error(new Error('... error in process'))
		return next(new Error('error'))
	}
})
q.on('terminated', (queueId, jobId) => {
	// q.getJob(jobId).then((job) => {
	//   func.processError(job[0].data, job[0].id)
	//   pino().info({ 'jobId': job[0].data.id }, 'Start Type Job terminated');
	//   pino(fs.createWriteStream('./mylog')).info({ 'fId': job[0].data.fId, 'jobId': job[0].data.id }, 'Start Type Job terminated')
	// }).catch(err => {
	//   pino().error(new Error(err));
	//   pino(fs.createWriteStream('./mylog')).error({ "error": err }, 'Error in Start Type Job terminated')
	// })
})
q.on('completed', (queueId, jobId, isRepeating) => {
	// q.getJob(jobId).then((job) => {
	//   func.processSuccess(job[0].data, job[0].id)
	//   pino().info({ 'jobId': job[0].data.id }, 'Start Type Job completed:')
	//   pino(fs.createWriteStream('./mylog')).info({ 'fId': job[0].data.fId, 'jobId': job[0].data.id }, 'Start Type Job completed:')
	// }).catch(err => {
	//   pino().error(new Error(err));
	//   pino(fs.createWriteStream('./mylog')).error({ "error": err }, 'Error in Start Type Job compleated')
	// })
})