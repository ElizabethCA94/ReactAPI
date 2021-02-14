Se crea un usuario en AWS para almacenar los datos en DynamoDB, permite guardar la información de los profesores al momento de registrarse y de los quizes que cree cada uno. Para que los profesores puedan  loguearse después y así editar los quizes.

Instalamos serverless: 
sudo npm install -g serverless
https://www.serverless.com/framework/docs/getting-started/

Agregamos las credenciales generadas en el archivo .csv

serverless config credentials --provider aws --key YOUR_KEY_ID --secret YOUR_SECRET_ACCESS_KEY --profile deploy-aws

ERROR: 'Missing credentials in config, if using AWS_CONFIG_FILE, set AWS_SDK_LOAD_CONFIG=1'

$ export AWS_ACCESS_KEY_ID=YOUR_KEY_ID
$ export AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY

Instalamos dynamoDB de forma local con el siguiente comando:
npm run install:dynamodb-local
ó
sls dynamodb install

ERROR: simple-git deprecation notice: git.silent: logging should be configured using the `debug` library / `DEBUG` environment variable, this will be an error in version 3

SOLUCIÓN: 

Si tenemos el JDK, lo desinstalamos y a continuación ingresamos el siguiente comando: 

npm install debug 

y volvemos a instalar dynamo
npm run install:dynamodb-local

Instalamos el JDK
npm run dev ó sls offline start

Instalamos dynamodb admin
sudo npm install -g dynamodb-admin

Y por último, iniciamos el ambiente de ejecución:
npm run dev ó sls offline start

Error: Missing credentials in config, if using AWS_CONFIG_FILE, set AWS_SDK_LOAD_CONFIG=1
Solución: export AWS_PROFILE=deploy-aws




