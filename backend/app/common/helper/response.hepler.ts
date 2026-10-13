interface IResponse {
  success: boolean;
  message?: string;
  data: object | null | any;
  total?: number;
}

export type ErrorResponse = IResponse & {
  error_code: number;
};

export const createResponse = (
  data: IResponse["data"],
  message?: string,
  total?: number
): IResponse => {
  return { data, total, message, success: true };
};
