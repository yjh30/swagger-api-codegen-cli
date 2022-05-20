# swagger-typescript-api

## 1. 参数详解
|   命令参数   |   配置参数    |    描述     |
| ----------- | ----------- | ----------- |
| --route-types                 | generateRouteTypes                                      | 为 API 路由生成类型定义(默认值: false)
| --no-client                   | generateClient（与左边命令相反意思）                        | 不生成 API 类
| --default-as-success          | defaultResponseAsSuccess                                | 使用 default 响应状态代码作为成功响应
| --templates                   | templates                                               | 自定义代码输出模板
| --union-enums                 | generateUnionEnums                                      | 生成所有“enum”类型作为联合类型(T1 \| T2 \| TN) (默认值: false)
| --responses                   | generateResponses                                       | 生成有关请求响应的附加信息
| specProperty                  | spec                                                    | 指定json
| --module-name-index           | moduleNameIndex                                         | 确定应该使用哪个路径索引进行路由分离(默认值: 0)
| --module-name-first-tag       | moduleNameFirstTag                                      | 根据tags中的第一个标签名进行路由分离
| --modular                     | modular                                                 | 为 http 客户端、数据契约和路由生成分离的文件(默认值: false)
| --single-http-client          | singleHttpClient                                        | 在 Api 构造器中初始化http实例属性，属性值为http client实例
| --extract-request-params      | extractRequestParams                                    | 将请求query生成类型定义
| --extract-request-body        | extractRequestBody                                      | 将请求体body生成类型定义
| --enum-names-as-values        | enumNamesAsValues                                       | 将“ x-enumNames”中的数组 生成一个枚举值，枚举成员值为枚举成员字符串
| --default-response            | defaultResponseType                                     | 默认响应数据data,error类型定义，一般定义为unknown类型，默认为void
| --js                          | toJS                                                    | true生成js文件，false生成ts文件
| --js--axios                   | toJS & httpClientType                                   | toJS为true,httpClientType为axios
| --axios                       | httpClientType                                          | client端请求类型，使用三方axios库 还是 原生fetch api
| --type-prefix                 | typePrefix                                              | 为ts类型名新增前缀（只针对json schema中的definitions）
| --type-suffix                 | typeSuffix                                              | 为ts类型名新增后缀（只针对json schema中的definitions）


## 2. 参数生成示例详解

### 2.1 generateRouteTypes
> 为 API 路由生成类型定义(默认值: false)

```ts
export namespace SomeTest {
  /**
   * @description This type should test bug https://github.com/acacode/swagger-typescript-api/issues/156 NOTE: all properties should be required
   * @name SomeTestList
   * @request GET:/some-test
   */
  export namespace SomeTestList {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      user: {
        foo: number;
        extra: {
          id: number;
          // ...
        };
      };
    };
  }
}
```

### 2.2 generateClient
> 生成 API 类

```ts
/**
 * @title GitHub
 * @version v3
 * @termsOfService https://help.github.com/articles/github-terms-of-service/#b-api-terms
 * @baseUrl https://api.github.com
 * @externalDocs https://developer.github.com/v3/
 *
 * Powerful collaboration, code review, and code management for open source and private projects.
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  emojis = {
    /**
     * @description Lists all the emojis available to use on GitHub.
     *
     * @name EmojisList
     * @request GET:/emojis
     */
    emojisList: (params: RequestParams = {}) =>
      this.request<Emojis, void>({
        path: `/emojis`,
        method: "GET",
        format: "json",
        ...params,
      }),
    // ...
  };
  // ...
}
```

### 2.3 defaultResponseAsSuccess
> 使用 default 响应状态代码作为成功响应

```json
// json schema
{
  "responses": {
    "200": {
      "description": "Successfully deleted",
      "schema": {
        "properties": {
          "status": {
            "description": "pending or done",
            "type": "string"
          }
        },
        "type": "object"
      }
    },
    "401": {
      "description": "Authentication error `auth-error`",
      "schema": {
        "$ref": "#/definitions/Error"
      }
    },
    "404": {
      "description": "Unknown key `unknown-key`",
      "schema": {
        "$ref": "#/definitions/Error"
      }
    },
    "409": {
      "description": "Confirm with code sent `confirm-first`",
      "schema": {
        "$ref": "#/definitions/Error"
      }
    },
    "default": {
      "$ref": "#/responses/ErrorResponse"
    }
  },
}
```
如果把responses中的200给去掉，那么default将会默认作为200成功状态响应
```ts
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  key = {
    /**
     * @description Revoke an Authentiq ID using email & phone. If called with `email` and `phone` only, a verification code will be sent by email. Do a second call adding `code` to complete the revocation.
     *
     * @tags key, delete
     * @name KeyRevokeNosecret
     * @request DELETE:/key
     */
    keyRevokeNosecret: (query: { email: string; phone: string; code?: string }, params: RequestParams = {}) =>
      // data, error响应类型
      // 如果json schema中responese没有200，那么由default替换，代码就会生成 `this.request<Error, Error>({ path, method, query, ... })`
      this.request<{ status?: string }, Error>({
        path: `/key`,
        method: "DELETE",
        query: query,
        format: "json",
        ...params,
      }),
  };
}  
```

### 2.4 templates
> 自定义代码输出模板

### 2.5 generateUnionEnums
> 生成所有“enum”类型作为联合类型(T1 | T2 | TN) (默认值: false)

```json
// json schemas
{
  "components": {
    "schemas": {
      "StringEnum": {
        "enum": ["String1", "String2", "String3", "String4"],
        "type": "string"
      },
      "NumberEnum": {
        "enum": [1, 2, 3, 4],
        "type": "number"
      },
      "BooleanEnum": {
        "enum": ["true", "false"],
        "type": "boolean"
      },
      "IntEnumWithNames": {
        "enum": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        "type": "integer",
        "description": "FooBar",
        "format": "int32",
        "x-enumNames": [
          "Unknown",
          "String",
          "Int32",
          "Int64",
          "Double",
          "DateTime",
          "Test2",
          "Test23",
          "Tess44",
          "BooFar"
        ]
      }
    }
  }
}

```
```ts
// 生成的枚举类型
export type StringEnum = "String1" | "String2" | "String3" | "String4";

export type NumberEnum = 1 | 2 | 3 | 4;

export type BooleanEnum = true | false;

/**
 * FooBar
 * @format int32
 */
export type IntEnumWithNames = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
```
### 2.6 generateResponses
> 生成有关请求响应的附加信息

```ts
/**
 * @title Authentiq
 * @version 6
 * @license Apache 2.0 (http://www.apache.org/licenses/LICENSE-2.0.html)
 * @termsOfService http://authentiq.com/terms/
 * @baseUrl https://6-dot-authentiqio.appspot.com
 * @contact Authentiq team <hello@authentiq.com> (http://authentiq.io/support)
 *
 * Strong authentication, without the passwords.
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  key = {
    /**
     * @description Revoke an Authentiq ID using email & phone. If called with `email` and `phone` only, a verification code will be sent by email. Do a second call adding `code` to complete the revocation.
     *
     * @tags key, delete
     * @name KeyRevokeNosecret
     * @request DELETE:/key
     * @response `200` `{ status?: string }` Successfully deleted
     * @response `401` `Error` Authentication error `auth-error`
     * @response `404` `Error` Unknown key `unknown-key`
     * @response `409` `Error` Confirm with code sent `confirm-first`
     * @response `default` `Error`
     */
    keyRevokeNosecret: (query: { email: string; phone: string; code?: string }, params: RequestParams = {}) =>
      this.request<{ status?: string }, Error>({
        path: `/key`,
        method: "DELETE",
        query: query,
        format: "json",
        ...params,
      }),
    
    // ...
  };
  // ...
}
```

### 2.7 spec
> 指定json对象

```js
const { generateApi } = require('swagger-typescript-api');

/* NOTE: all fields are optional expect one of `output`, `url`, `spec` */
generateApi({
  spec: {
    swagger: "2.0",
    info: {
      version: "1.0.0",
      title: "Swagger Petstore",
    },
    // ...
  },
  // ...
})

// 等价于下面代码
generateApi({
  spec: require('./schema.json'),

  // 等价下面url，input配置
  // url: 'https://xxx.com/api/schema.json',
  // input: './schema.json',
  // ...
})
```

### 2.8 moduleNameIndex
> 确定应该使用哪个路径索引进行路由分离(默认值: 0)

```json
{
  "paths": {
    "api/v1/pet": {
      "post": {
        "tags": ["pet"],
        "operationId": "addPet",
      },
      "put": {
        "tags": ["pet"],
        "operationId": "updatePet",
      }
    },
    "api/v1/pet/findByStatus": {
      "get": {
        "tags": ["pet"],
        "operationId": "findPetsByStatus",
      }
    },
    "api/v1/pet/findByTags": {
      "get": {
        "tags": ["pet"],
        "operationId": "findPetsByTags",
      }
    },
    "api/v1/pet/{petId}": {
      "get": {
        "tags": ["pet"],
        "operationId": "getPetById",
      },
      "post": {
        "tags": ["pet"],
        "operationId": "updatePetWithForm",
      },
      "delete": {
        "tags": ["pet"],
        "operationId": "deletePet",
      }
    },
    "api/v1/pet/{petId}/uploadImage": {
      "post": {
        "tags": ["pet"],
        "operationId": "uploadFile",
      }
    },
    "api/v1/store/inventory": {
      "get": {
        "tags": ["store"],
        "operationId": "getInventory",
      }
    },
    "api/v1/store/order": {
      "post": {
        "tags": ["store"],
        "operationId": "placeOrder",
      }
    },
    "api/v1/store/order/{orderId}": {
      "get": {
        "tags": ["store"],
        "operationId": "getOrderById",
      },
      "delete": {
        "tags": ["store"],
        "operationId": "deleteOrder",
      }
    },
    "api/v1/user": {
      "post": {
        "tags": ["user"],
        "operationId": "createUser",
      }
    },
    "api/v1/user/createWithArray": {
      "post": {
        "tags": ["user"],
        "operationId": "createUsersWithArrayInput",
      }
    },
    "api/v1/user/createWithList": {
      "post": {
        "tags": ["user"],
        "operationId": "createUsersWithListInput",
      }
    },
    "api/v1/user/login": {
      "get": {
        "tags": ["user"],
        "operationId": "loginUser",
      }
    },
    "api/v1/user/logout": {
      "get": {
        "tags": ["user"],
        "operationId": "logoutUser",
      }
    },
    "api/v1/user/{username}": {
      "get": {
        "tags": ["user"],
        "operationId": "getUserByName",
      },
      "put": {
        "tags": ["user"],
        "operationId": "updateUser",
      },
      "delete": {
        "tags": ["user"],
        "operationId": "deleteUser",
      }
    },
    "api/v1/{username}": {
      "get": {
        "tags": ["user"],
        "operationId": "getUserByName",
      },
      "put": {
        "tags": ["user"],
        "operationId": "updateUser",
      },
      "delete": {
        "tags": ["user"],
        "operationId": "deleteUser",
      }
    }
  },
}
```
```ts
// moduleNameIndex = 0
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  api = {
    // getUserByName
    // getUserByName2
  };
}
```
```ts
// moduleNameIndex = 1
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  v1 = {
    // getUserByName
    // getUserByName2
  };
}
```
```ts
// moduleNameIndex = 2
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  pet = {
    /**
     * No description
     *
     * @tags pet
     * @name AddPet
     * @summary Add a new pet to the store
     * @request POST:api/v1/pet
     * @secure
     */
    addPet: (body: Pet, params: RequestParams = {}) =>
      this.request<any, void>({
        path: `api/v1/pet`,
        method: "POST",
        body: body,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  store = {

  };
  user = {
    // getUserByName
  };
  username = {
    // getUserByName
  };
}
```

### 2.9 moduleNameFirstTag
> 同2.8示例 json schema，moduleNameFirstTag 优先 moduleNameIndex 设置，根据tags中的第一个标签名进行路由分离

```ts
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  pet = {
    /**
     * No description
     *
     * @tags pet
     * @name AddPet
     * @summary Add a new pet to the store
     * @request POST:api/v1/pet
     * @secure
     */
    addPet: (body: Pet, params: RequestParams = {}) =>
      this.request<any, void>({
        path: `api/v1/pet`,
        method: "POST",
        body: body,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  store = {

  };
  user = {
    // getUserByName
    // getUserByName2
    // 如果需要将getUserByName2分离，需要更改tags项第一个标签名user，如改为：userName
  };
}
```
优先级：<em style="color: red;">moduleNameFirstTag > moduleNameIndex </em> 如果json schema中没有tags字段，`moduleNameFirstTag`失效，`moduleNameIndex`生效，如果`moduleNameIndex`未设置，那么默认就是`moduleNameIndex: 0`效果


### 2.10 modular
> 为 http client、数据契约和路由生成分离的文件(默认值: false)

```
├── data-contracts.ts -> 对应json schema中definitions定义字段生成的文件
├── http-client.ts -> 客户端http请求类
├── Key.ts -> 路由分离生成的文件（可以理解为后端的一个service），命名根据元数据标签（tags中的第一个标签名）
├── KeyRoute.ts -> service对应的路由ts类型声明
├── Xxx.ts
├── XxxRoute.ts
```

### 2.11 singleHttpClient
> 在 Api 构造器中初始化http实例属性，属性值为http client实例

#### 2.11.1 singleHttpClient 开启
```ts
export class Api<SecurityDataType extends unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  key = {
    /**
     * @description Register a new ID `JWT(sub, devtoken)` v5: `JWT(sub, pk, devtoken, ...)` See: https://github.com/skion/authentiq/wiki/JWT-Examples
     *
     * @tags key, post
     * @name KeyRegister
     * @request POST:/key
     */
    keyRegister: (body: any, params: RequestParams = {}) =>
      this.http.request<{ secret?: string; status?: string }, any>({
        path: `/key`,
        method: "POST",
        body: body,
        format: "json",
        ...params,
      }),
  };
}

// 业务代码示例：
var api = new Api( new HttpClient() );

// api.http.request();
api.key.keyRegister();
```

#### 2.11.2 singleHttpClient 未开启
```ts
// singleHttpClient 为false生成的代码
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  key = {
    /**
     * @description Register a new ID `JWT(sub, devtoken)` v5: `JWT(sub, pk, devtoken, ...)` See: https://github.com/skion/authentiq/wiki/JWT-Examples
     *
     * @tags key, post
     * @name KeyRegister
     * @request POST:/key
     */
    keyRegister: (body: any, params: RequestParams = {}) =>
      this.request<{ secret?: string; status?: string }, any>({
        path: `/key`,
        method: "POST",
        body: body,
        format: "json",
        ...params,
      }),
  };
}

// 业务代码示例：
var api = new Api();

api.key.keyRegister({}, {});
```

#### 2.11.3
当 singleHttpClient 与 modular 配置都开启，每个api service同Api类逻辑一致

### 2.12 extractRequestParams
> 将请求参数query生成类型定义

```ts
export interface KeyRevokeNosecretParams {
  /** primary email associated to Key (ID) */
  email: string;

  /** primary phone number, international representation */
  phone: string;

  /** verification code sent by email */
  code?: string;
}

export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  key = {
    /**
     * @description Revoke an Authentiq ID using email & phone. If called with `email` and `phone` only, a verification code will be sent by email. Do a second call adding `code` to complete the revocation.
     *
     * @tags key, delete
     * @name KeyRevokeNosecret
     * @request DELETE:/key
     */
    keyRevokeNosecret: (query: KeyRevokeNosecretParams, params: RequestParams = {}) =>
      this.request<{ status?: string }, Error>({
        path: `/key`,
        method: "DELETE",
        query: query,
        format: "json",
        ...params,
      }),
  };
}
```

### 2.13 extractRequestBody
> 将请求体body生成类型定义

```ts
export interface SingleFormUrlEncodedRequestPayloadTTT {
  /** @format string */
  param1: string;
  param2: string;
}

export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  key = {
    /**
     * No description
     *
     * @tags pet
     * @name SingleFormUrlEncodedRequest
     * @summary summary
     * @request POST:/pet/single-form-url-encoded
     */
    singleFormUrlEncodedRequest: (data: SingleFormUrlEncodedRequestPayloadTTT, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/pet/single-form-url-encoded`,
        method: "POST",
        body: data,
        type: ContentType.UrlEncoded,
        ...params,
      }),
  };
}
```

### 2.14 enumNamesAsValues
> 将“ x-enumNames”中的数组 生成一个枚举值，枚举成员值为枚举成员字符串

```json
{
  "IntEnumWithNames": {
    "enum": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    "type": "integer",
    "description": "FooBar",
    "format": "int32",
    "x-enumNames": [
      "Unknown",
      "String",
      "Int32",
      "Int64",
      "Double",
      "DateTime",
      "Test2",
      "Test23",
      "Tess44",
      "BooFar"
    ]
  },
}
```

```ts
// 开启如下：
export enum IntEnumWithNames {
  Unknown = "Unknown",
  String = "String",
  Int32 = "Int32",
  Int64 = "Int64",
  Double = "Double",
  DateTime = "DateTime",
  Test2 = "Test2",
  Test23 = "Test23",
  Tess44 = "Tess44",
  BooFar = "BooFar",
}
```

```ts
// 未开启如下：
export enum IntEnumWithNames {
  Unknown = 0,
  String = 1,
  Int32 = 2,
  Int64 = 3,
  Double = 4,
  DateTime = 5,
  Test2 = 6,
  Test23 = 7,
  Tess44 = 8,
  BooFar = 9,
}
```


### 2.15 defaultResponseType
> 默认响应类型设置，一般设置为unknown类型


### 2.16 toJS
> true生成js文件，false生成ts文件


### 2.17 --js--axios
> toJS为true,httpClientType为axios

- toJS: true
- httpClientType: true


### 2.18 httpClientType
> client端请求类型，使用三方axios库 还是 原生fetch api


### 2.19 typePrefix
> 为ts类型名新增前缀（只针对json schema中的definitions）

- `typePrefix: 'IApi`

```ts
/**
 * A user or organization
 */
export interface SwaggerTypeActor {
  avatar_url?: string;
  bio?: string;
  // ...
}
```

### 2.20 typeSuffix
> 为ts类型名新增后缀（只针对json schema中的definitions）

- `typeSuffix: 'GeneratedDataContract'`

```ts
/**
 * A user or organization
 */
export interface ActorGeneratedDataContract {
  avatar_url?: string;
  bio?: string;
  // ...
}
```

### 2.21 其他
- --silent：只输出错误到控制台 (default: false)
- --clean-output：清除原有文件再生成 (default: false)
- --disableProxy：禁用代理选型 (default: false)
- --disableStrictSSL：禁用SSL  (default: false)
- --name：生成的api文件名
- --output：生成文件的输出目录
- --path：swagger json协议的path/url
- --version：版本

## 3. 配置讨论
|   配置参数   |   值（true \| false \| number \| string）    |    json schema字段依赖     |
| ----------- | ----------- | ----------- |
| toJS                               | false| 
| generateRouteTypes                 | false |   paths
| generateClient                     | true |   
| generateResponses                  | true |   responses
| moduleNameIndex                    | 1 |      api/pet
| moduleNameIndex                    | 2 |      api/v1/pet
| moduleNameFirstTag                 | true |   tags
| modular                            | false |   
| extractRequestParams               | true |   query
| extractRequestBody                 | true |   data
| enumNamesAsValues                  | true |   x-enumNames
| httpClientType                     | true |   
| singleHttpClient                   | true |   
| cleanOutput                        | true |   
| defaultResponseType                |unknown| 
| typePrefix                         | I | 


## 4. 其他考虑
- 多入口处理（多个swagger json schema）
- service 方法名 依赖 json schema 中的 operationId
