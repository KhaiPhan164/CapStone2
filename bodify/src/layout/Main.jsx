import Header from "./Header";
import Home from "../pages/Homes/Home";
import Classes from "../pages/Homes/Classes";
import FitnessNow from "../pages/Homes/FitnessNow";
import Footer from "./Footer";
import Choose from "../pages/Homes/Choose";
import MeetPT from "../pages/Homes/MeetPT";

const Main = () => {
  return (
    <div>
      <Header />
      <Home />
      <Classes />
      <FitnessNow />
      <Choose />
      <MeetPT />
      <Footer />
    </div>
  );
};

export default Main
