import { ValidationError } from "yup";

export function errorWithKeys(error: ValidationError) {
  return error.inner.map(x => {
    let _obj: any = {}
    // @ts-ignore
    _obj[x.path] = x.errors[0];
    return _obj;
  }).reduce((acc, error) => {
    const key = Object.keys(error)[0];
    acc[key] = error[key];
    return acc;
  }, {})
}
