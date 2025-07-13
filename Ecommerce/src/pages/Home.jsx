import React from 'react';
import TextWithHover from '../components/shared/TextWithHover';
import HeroSection from '../components/Herosection';

const products = [
  {
    name: "Cow Milk",
    desc: "Fresh, pure cow milk. Delivered daily.",
    price: "₹60/litre",
    img: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Whole Wheat Flour",
    desc: "Stone-ground, high-fiber wheat flour.",
    price: "₹45/kg",
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Basmati Rice",
    desc: "Aromatic long-grain rice, perfect for biryani.",
    price: "₹120/kg",
    img: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Organic Ghee",
    desc: "Pure desi ghee made from cow's milk.",
    price: "₹400/500ml",
    img: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80"
  }
];

const focusCardData = [
  {
    title: "Healthy Breakfast",
    description: "Start your day with nutritious breakfast ideas.",
    imgUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "Protein Power",
    description: "High-protein vegetarian meal plans.",
    imgUrl: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80"
  }
];

const Card = ({ title, description, imgUrl }) => (
  <div className='bg-black bg-opacity-40 w-1/5 min-w-[180px] p-4 rounded-lg'>
    <div className='pb-4 pt-2'>
      <img className='w-full rounded-md' src={imgUrl} alt={title} />
      <div className='text-white font-semibold py-3'>{title}</div>
      <div className='text-gray-500 text-xs'>{description}</div>
    </div>
  </div>
);

const PlaylistView = ({ titleText, cardsData }) => (
  <div className='text-white mt-8'>
    <div className='text-2xl font-semibold mb-5'>{titleText}</div>
    <div className='w-full flex flex-wrap gap-4'>
      {(cardsData || []).map((item, idx) => (
        <Card
          key={item.title + idx}
          title={item.title}
          description={item.description}
          imgUrl={item.imgUrl}
        />
      ))}
    </div>
  </div>
);

const Home = () => (
  <div className="w-full min-h-screen bg-app-black overflow-auto">
    {/* Navbar */}
    <div className='navbar w-full h-16 bg-black items-center justify-end opacity-90 flex px-4'>
      <div className='w-1/2 h-full flex'>
        <div className='w-3/5 flex justify-around items-center'>
          <TextWithHover displayText={"Premium"} />
          <TextWithHover displayText={"Support"} />
          <TextWithHover displayText={"Download"} />
          <div className='h-1/2 border-r border-white'></div>
        </div>
        <div className='flex w-2/5 justify-around h-full items-center'>
          <TextWithHover displayText={"Sign up"} />
          <div className='bg-white h-2/3 px-8 flex items-center justify-center rounded-full font-semibold cursor-pointer'>
            Log in
          </div>
        </div>
      </div>
    </div>

    {/* Hero Section and Products */}
    <div className="bg-gradient-to-br from-white via-white-100 to-white-300">
      <HeroSection />
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-8 text-red-800 border-l-4 border-red-400 pl-4">
          Popular Products
        </h2>
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((item, idx) => (
            <div
              className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center border-t-4 border-red-400 hover:border-red-400 transition"
              key={idx}
            >
              <img
                src={item.img}
                alt={item.name}
                className="w-32 h-32 object-cover rounded-full border-4 border-red-200 mb-4"
              />
              <h3 className="text-lg font-bold text-red-700 mb-2">{item.name}</h3>
              <p className="text-sm text-red-500 mb-1">{item.desc}</p>
              <p className="text-md font-semibold text-red-500 mb-3">{item.price}</p>
              <button className="mt-auto px-4 py-1 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>

    {/* Playlists Section */}
    <div className='content p-8 pt-0 overflow-auto'>
      <PlaylistView titleText="Featured Collections" cardsData={focusCardData} />
    </div>
  </div>
);

export default Home;
