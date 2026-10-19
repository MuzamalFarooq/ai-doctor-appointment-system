export function excludeDemoData(where) {
  return {
    AND: [
      where,
      {
        OR: [
          { demoData: false },
          { demoData: { isSet: false } },
        ],
      },
    ],
  };
}
