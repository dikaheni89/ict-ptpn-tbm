export interface IResponseMessage {
    code?: number,
    status?: 'success' | 'error' | 'warning' | 'info',
    message?: string,
    error?: string,
    errors?: { [key: string]: string }
}

export class ResponseMessage {
    public code: number;
    public status: string;
    public message: string;
    public error: string | null;
    public errors: { [key: string]: string }


    constructor(response?: IResponseMessage) {
        this.code = response?.code || 200;
        this.status = response?.status || 'success';
        this.message = response?.message || '';
        this.error = response?.error || null;
        this.errors = response?.errors || {};
    }
}

export interface IResponseData {
    code?: number,
    status?: 'success' | 'error' | 'warning' | 'info',
    data?: {},
    error?: null | string,
    errors?: { [key: string]: string }
}

export class ResponseData {
    public code: number;
    public status: string;
    public data: {};
    public error: string | null;
    public errors: { [key: string]: string }


    constructor(response?: IResponseData) {
        this.code = response?.code || 200;
        this.status = response?.status || 'success';
        this.data = response?.data || {}
        this.error = response?.error || null
        this.errors = response?.errors || {}
    }
}

export interface IResponseTable {
    rows: Array<any>,
    total_data?: number
  }
  
  export class ResponseTable {
  
    public rows: Array<any>;
    public total_data: number;
  
  
    constructor(response?: IResponseTable) {
      this.rows = response?.rows || [];
      this.total_data = response?.total_data || this.rows.length || 0
    }
  }