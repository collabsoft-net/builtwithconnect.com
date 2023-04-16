/* eslint-disable no-prototype-builtins */
import * as functions from 'firebase-functions';


const isDate = (value: object): boolean =>
  !!value &&
  !!value.hasOwnProperty &&
  value.hasOwnProperty('_seconds') &&
  value.hasOwnProperty('_nanoseconds');

const isGeo = (value: object): boolean =>
  !!value &&
  !!value.hasOwnProperty &&
  value.hasOwnProperty('_latitude') &&
  value.hasOwnProperty('_longitude');

export const toAppSearch = (
  data: Record<string, unknown> = {}
): Record<string, unknown> => {

  return Object.entries(data).reduce((acc, [ fieldName ]) => {
    let fieldValue;
    let parsedFieldName = fieldName.split('::')[0];
    let renameTo = fieldName.split('::')[1];

    // If a user specified 'a::1' and there was literally an 'a::1' field, then dont attempt any renaming
    if (data.hasOwnProperty(fieldName)) {
      fieldValue = data[fieldName];
      parsedFieldName = fieldName;
      renameTo = '';
    } else if (data.hasOwnProperty(parsedFieldName)) {
      fieldValue = data[parsedFieldName];
    }

    if (fieldValue === undefined || fieldValue === null) return acc;

    // App Search only supports lowercased alpha numeric names or underscores
    const processedFieldName = (renameTo || parsedFieldName)
      .replace(/[^A-Za-z0-9_]/g, '')
      .toLowerCase();

    if (processedFieldName === '') {
      functions.logger.warn(
        `Skipped indexing a field named ${parsedFieldName}. Attempted to rename the field to remove special characters which resulted in an empty string. Please use the "::" syntax to rename this field. Example: ${parsedFieldName}::some_other_field_name.`
      );
      return acc;
    }

    if (isDate(fieldValue as object)) {
      return {
        ...acc,
        [processedFieldName]: new Date(
          (fieldValue as unknown as Record<string, number>)._seconds * 1000
        ).toISOString(),
      };
    }

    if (isGeo(fieldValue as object)) {
      return {
        ...acc,
        [processedFieldName]: `${(fieldValue as unknown as Record<string, string>)._latitude},${(fieldValue as unknown as Record<string, string>)._longitude}`,
      };
    }

    if (Array.isArray(fieldValue)) {
      return {
        ...acc,
        [processedFieldName]: fieldValue.reduce((acc, arrayFieldValue) => {
          // App search does not support nested arrays, so ignore nested arrays
          if (Array.isArray(arrayFieldValue)) return acc;

          if (isDate(arrayFieldValue)) {
            return [
              ...acc,
              new Date(arrayFieldValue._seconds * 1000).toISOString(),
            ];
          }

          if (isGeo(arrayFieldValue)) {
            return [
              ...acc,
              `${arrayFieldValue._latitude},${arrayFieldValue._longitude}`,
            ];
          }

          return [...acc, arrayFieldValue];
        }, []),
      };
    }

    return {
      ...acc,
      [processedFieldName]: fieldValue,
    };
  }, {});
};