const PagePlaceholder = ({ title, description }) => {
  return (
    <section className="flex w-full flex-col items-center justify-center gap-3 text-center">
      <span aria-hidden="true" className="h-2 w-12 rounded-full bg-primary" />
      <h1 className="text-2xl font-bold text-text-main">{title}</h1>
      {description && <p className="text-sm text-text-muted">{description}</p>}
    </section>
  );
};

export default PagePlaceholder;
