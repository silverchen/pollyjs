import mergeWith from 'lodash-es/mergeWith';

function customizer(objValue: any, srcValue: any, key: string) {
  // Arrays and `context` options should just replace the existing value
  // and not be deep merged.
  if (Array.isArray(objValue) || ['context'].includes(key)) {
    return srcValue;
  }
}

export default function mergeConfigs(...configs: object[]) {
  return mergeWith({}, ...configs, customizer);
}
