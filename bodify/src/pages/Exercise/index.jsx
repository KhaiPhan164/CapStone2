import Footer from "../../layout/Footer";
import Header from "../../layout/Header";
import { HomeBanner } from "./Banner";
import { PopularSearch } from "./PopularSearch";

export const ExerciseHome = () => {
return (
    <div>
        <Header/>
        <div className="flex flex-col">
        <HomeBanner />
        <PopularSearch/>
        </div>
        <Footer/>
    </div>
    ); 
};
