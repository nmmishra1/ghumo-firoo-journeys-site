
import React from 'react';

const ContactHero = () => {
  return (
    <section 
      className="relative h-[50vh] bg-cover bg-center bg-no-repeat flex items-center justify-center"
      style={{
        backgroundImage: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&h=600&fit=crop')"
      }}
    >
      <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
        <p className="text-xl">Get in touch to plan your perfect journey</p>
      </div>
    </section>
  );
};

export default ContactHero;
