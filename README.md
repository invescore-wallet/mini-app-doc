##  1. Javascript API

![General overview](resources/sequence.svg?raw=true "Sequence diagram 1.1")

### 1.1 PocketJS

Pocket аппликейшнээс window.PocketMobile нэртэй channel тодорхойлсон ба үүнтэй холбогдох үйлдлүүдийг pocket.js файлд хэрэгжүүлсэн болно.

Энэхүү файлыг </body> таг хаагдахаас өмнө оруулах хэрэгтэй.


``` html
<body>
  ...
  <script src="public/pocket.js" type="text/javascript" />
</body>
```

### 1.2 Хэрэглэгчийн ID токен авах

window.Pocket.getToken функц нь [DOM ready](https://developer.mozilla.org/en-US/docs/Web/API/Window/DOMContentLoaded_event) үед ажиллах ёстой.

Энэхүү функцийн callback-д хэрэглэгчийн зөвхөн зөвшөөрөл олгосон OAuth2.0 Authorization scope-уудад хамаарах мэдээллийг л access_token байдлаар буцаадаг.

``` javascript
const onGetToken = params => {
  if (params.error) {
    console.log(params.errorMessage);
  } else {
    console.log(params.data);

    // TODO: 1.3-д тодорхойлсон үйлдлийг энд гүйцэтгэнэ үү.
  }
}

window.Pocket.getToken({}, onGetToken);
```

### 1.3. ID токенийг задлах


Токен задлах үйлдэлд мерчант байгууллагын sensetive мэдээлэл шаардлагатай болдог тул энэхүү үйлдлийг нууцлалын зарчмын дагуу өөрсдийн сервер тал дээр гүйцэтгэх шаардлагатайг анхаарна уу.

Хэрэглэгчийн `access_token` нь JWT форматтай ба signature нь RSA256 алгоримтыг ашигладаг.

OAuth2.0 серверийн олгосон `PUBLIC_KEY`-ийг ашиглан задлах буюу баталгаажуулах боломжтой.

Мөн түүнээс гадна доорх сангуудыг ашиглахыг зөвлөж байна.

- [jwt-go /golang/](https://github.com/dgrijalva/jwt-go)

- [php-jwt /php/](https://github.com/firebase/php-jwt)

- [pyjwt /python/](https://pyjwt.readthedocs.io/en/stable/)

- [jsonwebtoken /nodejs/](https://www.npmjs.com/package/jsonwebtoken)


Мөн үүнээс гадна Postman collection-д тодорхойлсон token-introspect endpoint-ийг өөрсдийн сервер талаас дуудаж шалгах боломжтой.


## 2. Serverside API

### 2.1. Serverside токен авах

Pocket сервисүүдрүү хандахдаа Мерчант байгууллагад зориулан боловсруулсан `client_id, client_secret`-ийг ашиглана.

Энэхүү мэдээлэл нь мини-аппын үйл ажиллагаатай холбогдох нууцлал бүхий мэдээлэл учир алдагдахаас сэргийлэхийн тулд доорх зөвлөмжийг баримтална уу.

1. Хэрэглэгчийн браузер буюу клиент тал дээр ямар нэгэн байдлаар ашиглахгүй байх

2. Дурын этгээдэд дамжуулахгүй байх г.м

#### Header parameters:

  - `Content-Type: application/x-www-form-urlencoded`

#### Body parameters:
  - client_id

  - client_secret

  - grant_type="client_credentials"


``` bash
curl --location --request POST 'https://sso-staging.invescore.mn/auth/realms/invescore/protocol/openid-connect/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'client_id=${YOUR_CLIENT_ID}' \
--data-urlencode 'client_secret=${YOUR_CLIENT_SECRET}' \
--data-urlencode 'grant_type=client_credentials'
```

Хүсэлтийн хариуны бүтэц:

`Content-Type: application/json`

``` json

{
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwi..",
    "expires_in": 600,
    "refresh_expires_in": 604800,
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5..",
    "token_type": "bearer",
    "not-before-policy": 1601729075,
    "session_state": "a5003d2a..",
}
```

Дээрх хүсэлтийн хариуд мерчант байгууллагад зориулсан токен хүлээн авна.
Энэхүү токенийг ашиглаж нэхэмжлэхтэй холбоотой үйлдлүүд болон тохиргооны мэдээллийг засварлах боломжтой

### 2.2. Нэхэмжлэх үүсгэх

#### Header parameters:
  - Authorization: `client_id, client_secret` ашиглан авсан мерчантын токен

  - Content-Type: application/json

#### Body parameters:
  - amount: нэхэмжлэхийн үнийн дүн /доод дүн: 500₮/

  - info: гүйлгээний тэмдэглэл

  - consumerToken: мини-аппаар үйлчлүүлж байгаа хэрэглэгчийн токен (1.2 дугаар хэсэгт дурдагдсан ID токен)

``` bash

curl --location --request POST 'https://service-staging.invescore.mn/merchant/consumer/invoice' \
--header 'Authorization: Bearer ${ ACCESS_TOKEN }' \
--header 'Content-Type: application/json' \
--data-raw '{
    "amount": 560,
    "info": "Нэхэмжлэх",
    "consumerToken": "${ USER ID TOKEN }"
}'
```

### 2.3. Нэхэмжлэхийн мэдэгдэл хүлээн авах хаяг


Нэхэмжлэх амжилттай төлөгдсний дараа мерчантын тохируулсан хаягруу HTTP хүсэлтийг илгээдэг.

Тохиргооны мэдээлэл шалгах хүсэлт:

``` bash
curl --location --request GET 'http://service-staging.invescore.mn/merchant/pg/config' \
--header 'Authorization: Bearer ${ACCESS_TOKEN}' \
```

Тохиргооны хүсэлт:

``` bash

curl --location --request POST 'http://service-staging.invescore.mn/merchant/pg/config' \
--header 'Authorization: Bearer ${ACCESS_TOKEN}' \
--header 'Content-Type: application/json' \
--data-raw '{
 "fallBackUrl": "https://WEB_HOOK_URI"
}'
```


### WEBHOOK хүсэлтийн бүтэц

Header:

  - Content-Type: application/json

Body:

``` json
{
  "id": "Гүйлгээний бичилтийн дугаар",
  "amount": "Гүйлгээний үнийн дүн",
  "info": "Гүйлгээний тэмдэглэл",
  "invoiceId": "Нэхэмжлэхийн дугаар",
  "invoiceState": "Нэхэмжлэхийн төлөв",
  "phoneNumber": "Төлбөр төлөгчийн утасны дугаар"
}
```


### 2.4. Нэхэмлэхийн төлөв шалгах

``` bash 

curl --location --request GET 'https://service-staging.invescore.mn/merchant/invoice/check/${INVOICE_ID}' \
--header 'Authorization: Bearer ${ ACCESS_TOKEN }'
```
