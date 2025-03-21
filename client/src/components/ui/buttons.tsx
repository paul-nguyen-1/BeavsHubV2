export const quickActions = (props: string[]) => {
  const [image, alt, header] = props;
  return (
    <div className="flex items-center justify-center space-x-4">
      <img src={image} alt={alt} />
      <h1>{header}</h1>
    </div>
  );
};
