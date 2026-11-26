const paths = {
  menu: 'M4 6h16M4 12h16M4 18h16',
  moon: 'M20.9 13.4A9 9 0 0 1 10.6 3.1 9 9 0 1 0 20.9 13.4Z',
  sun: 'M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  generator: 'm12 3 8 9-8 9-8-9 8-9Zm0 5 3.5 4-3.5 4-3.5-4 3.5-4Z',
  list: 'M5 5h14v14H5zM8 9h8m-8 3h8m-8 3h8',
  eye: 'M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  eyeOff: 'm3 3 18 18M10 6.2a11 11 0 0 1 2-.2c6.5 0 10 6 10 6a13 13 0 0 1-3 3.4M6.2 7.7A14.8 14.8 0 0 0 2 12s3.5 6 10 6a10 10 0 0 0 4.1-.8M10 10a2.8 2.8 0 0 0 4 4',
  chevron: 'm6 9 6 6 6-6',
  close: 'm6 6 12 12M18 6 6 18',
  check: 'm5 12 4 4L19 6',
} as const;

export function Icon({ name }: { name: keyof typeof paths }) {
  return (
    <svg className="icon-glyph" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  );
}
