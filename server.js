const http = require( 'http' ),
      fs   = require( 'fs' ),
      // IMPORTANT: you must run `npm install` in the directory for this assignment
      // to install the mime library if you're testing this on your local machine.
      // On Render, make sure `npm install` is your build command.
      mime = require( 'mime' ),
      dir  = 'public/',
      port = 3000

const appData = []

const server = http.createServer( function( request,response ) {
  if( request.method === 'GET' ) {
    handleGet( request, response )    
  }else if( request.method === 'POST' ){
    handlePost( request, response ) 
  }
})

const handleGet = function( request, response ) {
  const filename = dir + request.url.slice( 1 ) 

  if( request.url === '/' ) {
    sendFile( response, 'public/index.html' )
  }else{
    sendFile( response, filename )
  }
}

const handlePost = function( request, response ) {
  let dataString = ''

  request.on( 'data', function( data ) {
      dataString += data 
  })

  request.on( 'end', function() {
    switch (request.url) {
      case '/submit':
        data = JSON.parse(dataString)
        setResult(data)
        appData.push(data)
        break;

      case '/delete':
        index = parseInt(dataString)
        appData.splice(index, 1)
        break;

      case '/modify':
        data = JSON.parse(dataString)
        setResult(data)

        //pull out the index to modify and prevent it from getting saved
        index = data.modifying
        delete data.modifying

        appData.splice(index, 1, data)
        break;
    }

    response.writeHead( 200, 'OK', {'Content-Type': 'text/plain' })
    response.end(JSON.stringify(appData))
  })
}

const sendFile = function( response, filename ) {
   const type = mime.getType( filename ) 

   fs.readFile( filename, function( err, content ) {

     // if the error = null, then we've loaded the file successfully
     if( err === null ) {

       // status code: https://httpstatuses.com
       response.writeHeader( 200, { 'Content-Type': type })
       response.end( content )

     }else{

       // file not found, error code 404
       response.writeHeader( 404 )
       response.end( '404 Error: File Not Found' )

     }
   })
}

const setResult = function(data) {
  if(data.userScore > data.oppScore) { data.result = "Win" }
  else if(data.userScore < data.oppScore) { data.result = "Loss" }
  else { data.result = "Tie" }
}

server.listen( process.env.PORT || port )
