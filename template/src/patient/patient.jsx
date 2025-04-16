import { Navigation } from "./navigation";
import { Homepage } from "./homepage";
import { ListeSpecialites } from "./specialite";
import { Contact } from "./contact";
import Complaint from './Complaint';

export default function Pation() {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;

  return (
    <>
      <Navigation />
      <div id="home">
        <Homepage />
      </div>
      <div id="specialite">
        <ListeSpecialites />
      </div>
      <div id="complaints">
        <Complaint userId={userId} />
      </div>
      <div id="contact">
        <Contact userId={userId} />
      </div>
    </>
  );
}
