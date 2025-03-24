export const QuickActions = ({
  image,
  alt,
  header,
}: {
  image: string;
  alt: string;
  header: string;
}) => {
  return (
    <div className="flex items-center flex-col justify-center space-x-4">
      <img src={image} alt={alt} />
      <h1>{header}</h1>
    </div>
  );
};
