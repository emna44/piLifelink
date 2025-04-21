import React from 'react';
import { Navigation } from "./Navigation";
import { Homepage } from "./homepage";
import { ListeSpecialites } from "./specialite";
import { Contact } from "./contact";
import { Complaint } from "./Complaint";

export default function Patient() {
  return (
    <div>
      <Navigation />
      <Homepage /> {/* Appel de Homepage */}
      <ListeSpecialites />{/* List des specialites */ }
      <Complaint></Complaint>{/* Complaint */ }   
      <Contact></Contact>{/* Contact */ }
    </div>
  );
}
