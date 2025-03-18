import { SearchBox } from "./SearchBox";

export const HomeBanner = ({ onSearch }) => {
 return (
  <div className="mt-14 flex flex-col gap-y-6 items-center justify-start px-4 md:px-0">
   <div className="flex flex-col items-center gap-y-4 text-center">
    <h1 className="flex text-[#00000096] text-4xl md:text-6xl space-x-3 items-center font-medium">
     <p>
      Exercise Post List
     </p>
    </h1>
   </div>
   <SearchBox onSearch={onSearch} />
  </div>
 );
};
