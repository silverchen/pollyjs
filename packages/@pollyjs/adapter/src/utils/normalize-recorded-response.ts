import HARResponse from '../../../persister/src/har/response';
import INVPair from '../../../persister/src/har/utils/get-first-header';
import { IHTTPHeaders } from '../../../core/src/utils/http-headers';

const { isArray } = Array;

export default function normalizeRecordedResponse(response: HARResponse) {
  const { status, statusText, headers, content } = response;

  return {
    statusText,
    statusCode: status,
    headers: normalizeHeaders(headers),
    body: content && content.text
  };
}

function normalizeHeaders(headers?: IHTTPHeaders[]) {
  return (headers || []).reduce(
    (accum, { name, value, _fromType }: INVPair) => {
      const existingValue = accum[name];

      if (existingValue) {
        if (!isArray(existingValue)) {
          accum[name] = [existingValue];
        }

        accum[name].push(value);
      } else {
        accum[name] = _fromType === 'array' ? [value] : value;
      }

      return accum;
    },
    {}
  );
}
