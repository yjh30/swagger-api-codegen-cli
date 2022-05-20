export interface ILoginBody {
  /** 密码 */
  password?: string;

  /** 用户名 */
  username?: string;
}

export interface IWxCpBindBody {
  /** @format int64 */
  appId?: number;

  /** openId */
  openId?: string;

  /** 密码 */
  password?: string;

  /** @format int32 */
  type?: number;

  /**
   * userId
   * @format int64
   */
  userId?: number;

  /** 用户名 */
  username?: string;
}

export interface IWxCpBody {
  /** @format int64 */
  appId?: number;

  /** @format int32 */
  type?: number;
}

export interface IResultDTOObject {
  /** @format int32 */
  code?: number;
  data?: object;
  msg?: string;

  /** @format int64 */
  procEndTime?: number;

  /** @format int64 */
  procStartTime?: number;
}

export interface IAuthLoginGetUsingGetParams {
  /** @format int64 */
  appId?: number;
  code?: string;

  /** @format int32 */
  type?: number;
}

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, ResponseType } from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({ securityWorker, secure, format, ...axiosConfig }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({ ...axiosConfig, baseURL: axiosConfig.baseURL || "//192.168.1.22:36000/api" });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  private mergeRequestParams(params1: AxiosRequestConfig, params2?: AxiosRequestConfig): AxiosRequestConfig {
    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.instance.defaults.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  private createFormData(input: Record<string, unknown>): FormData {
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      formData.append(
        key,
        property instanceof Blob
          ? property
          : typeof property === "object" && property !== null
          ? JSON.stringify(property)
          : `${property}`,
      );
      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = (format && this.format) || void 0;

    if (type === ContentType.FormData && body && body !== null && typeof body === "object") {
      requestParams.headers.common = { Accept: "*/*" };
      requestParams.headers.post = {};
      requestParams.headers.put = {};

      body = this.createFormData(body as Record<string, unknown>);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
        ...(requestParams.headers || {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title OMS API 文档
 * @version 1.0
 * @baseUrl //192.168.1.22:36000/api
 *
 * OMS API 文档
 */
export class Api<SecurityDataType extends unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  token = {
    /**
     * No description
     *
     * @tags token, token控制
     * @name LoginUsingPost
     * @summary 登录
     * @request POST:/api/auth/login
     * @response `200` `IResultDTOObject` OK
     * @response `201` `unknown` Created
     * @response `401` `unknown` Unauthorized
     * @response `403` `unknown` Forbidden
     * @response `404` `unknown` Not Found
     */
    loginUsingPost: (form: ILoginBody, params: RequestParams = {}) =>
      this.http.request<IResultDTOObject, unknown>({
        path: `/api/auth/login`,
        method: "POST",
        body: form,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags token, token控制
     * @name LogoutUsingPost
     * @summary logout
     * @request POST:/api/auth/logout
     * @response `200` `IResultDTOObject` OK
     * @response `201` `unknown` Created
     * @response `401` `unknown` Unauthorized
     * @response `403` `unknown` Forbidden
     * @response `404` `unknown` Not Found
     */
    logoutUsingPost: (params: RequestParams = {}) =>
      this.http.request<IResultDTOObject, unknown>({
        path: `/api/auth/logout`,
        method: "POST",
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags token, token控制
     * @name RefreshUsingPost
     * @summary refresh
     * @request POST:/api/auth/refresh
     * @response `200` `IResultDTOObject` OK
     * @response `201` `unknown` Created
     * @response `401` `unknown` Unauthorized
     * @response `403` `unknown` Forbidden
     * @response `404` `unknown` Not Found
     */
    refreshUsingPost: (params: RequestParams = {}) =>
      this.http.request<IResultDTOObject, unknown>({
        path: `/api/auth/refresh`,
        method: "POST",
        type: ContentType.Json,
        ...params,
      }),
  };
  wechart = {
    /**
     * No description
     *
     * @tags wechart, 微信控制
     * @name AuthLoginGetUsingGet
     * @summary 授权登录
     * @request GET:/api/auth/wxcp/authLogin
     * @response `200` `unknown` OK
     * @response `401` `unknown` Unauthorized
     * @response `403` `unknown` Forbidden
     * @response `404` `unknown` Not Found
     */
    authLoginGetUsingGet: (query: IAuthLoginGetUsingGetParams, params: RequestParams = {}) =>
      this.http.request<unknown, unknown>({
        path: `/api/auth/wxcp/authLogin`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags wechart, 微信控制
     * @name BindUserUsingPost
     * @summary 绑定用户
     * @request POST:/api/auth/wxcp/bindUser
     * @response `200` `IResultDTOObject` OK
     * @response `201` `unknown` Created
     * @response `401` `unknown` Unauthorized
     * @response `403` `unknown` Forbidden
     * @response `404` `unknown` Not Found
     */
    bindUserUsingPost: (bindBody: IWxCpBindBody, params: RequestParams = {}) =>
      this.http.request<IResultDTOObject, unknown>({
        path: `/api/auth/wxcp/bindUser`,
        method: "POST",
        body: bindBody,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags wechart, 微信控制
     * @name GetAuthUrlUsingPost
     * @summary 获取授权URL
     * @request POST:/api/auth/wxcp/getAuthUrl
     * @response `200` `IResultDTOObject` OK
     * @response `201` `unknown` Created
     * @response `401` `unknown` Unauthorized
     * @response `403` `unknown` Forbidden
     * @response `404` `unknown` Not Found
     */
    getAuthUrlUsingPost: (wxCpBody: IWxCpBody, params: RequestParams = {}) =>
      this.http.request<IResultDTOObject, unknown>({
        path: `/api/auth/wxcp/getAuthUrl`,
        method: "POST",
        body: wxCpBody,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags wechart, 微信控制
     * @name UnbindUserUsingPost
     * @summary 用户解绑
     * @request POST:/api/auth/wxcp/unbindUser
     * @response `200` `IResultDTOObject` OK
     * @response `201` `unknown` Created
     * @response `401` `unknown` Unauthorized
     * @response `403` `unknown` Forbidden
     * @response `404` `unknown` Not Found
     */
    unbindUserUsingPost: (params: RequestParams = {}) =>
      this.http.request<IResultDTOObject, unknown>({
        path: `/api/auth/wxcp/unbindUser`,
        method: "POST",
        type: ContentType.Json,
        ...params,
      }),
  };
}
