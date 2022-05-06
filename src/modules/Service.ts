export type Options = {
  data?: any;
  headers?: Object;
  timeout?: number;
};

type RequestOptions = {
  headers?: object;
  data?: any;
  method: string;
};

enum METHODS {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

function queryStringify(data: { [key: string]: string }) {
  return Object.entries(data).reduce((res, [key, value]) => {
    return `${res}${key}=${value}&`;
  }, '?');
}

export class HTTPTransport {
  constructor(readonly _baseURL: string) {}

  get = (url: string, options: Options = {}) => {
    if (options.data) url += queryStringify(options.data);
    return this.request( url, { ...options, method: METHODS.GET }, options.timeout );
  };

  post = (url: string, options: Options = {}) => {
    return this.request( url, { ...options, method: METHODS.POST }, options.timeout );
  };

  put = (url: string, options: Options = {}) => {
    return this.request( url, { ...options, method: METHODS.PUT }, options.timeout );
  };

  delete = (url: string, options: Options = {}) => {
    return this.request( url, { ...options, method: METHODS.DELETE }, options.timeout );
  };

  request = ( url: string, options: RequestOptions, timeout: number = 5000 ): Promise<any> => {
    const { headers = {}, method, data } = options;
    url = `${this._baseURL}${url}`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.onload = () => {
        if (xhr.status < 400) {
          resolve(xhr);
        } else {
          reject(xhr);
        }
      };
      xhr.onabort = reject;
      xhr.onerror = reject;
      xhr.ontimeout = reject;
      xhr.timeout = timeout;
      xhr.withCredentials = true;
      xhr.responseType = 'json';

      const headersEntries = Object.entries(headers);
      if (headersEntries.length) headersEntries.forEach((header) => xhr.setRequestHeader(header[0], header[1]) );
      else xhr.setRequestHeader('Content-Type', 'application/json');

      if (method === METHODS.GET || !data) xhr.send(JSON.stringify({ status: 200 }));
      else {
        xhr.send(JSON.stringify(data));
        // console.log(JSON.stringify(data));
      }
    });
  };
}
