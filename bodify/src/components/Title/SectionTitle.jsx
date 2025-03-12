import clsx from "clsx";

export const SectionTitle = ({ title, className }) => {
  return (
    <div className={clsx("text-xl font-semibold text-text", className)}>
      {title}
    </div>
  );
};