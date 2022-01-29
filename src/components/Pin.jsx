import React,{useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { MdDownloadForOffline } from 'react-icons/md';
import  {AiTwotoneDelete} from 'react-icons/ai';
import {BsFillArrowRightCircleFill} from 'react-icons/bs';

import { client, urlFor } from '../client';
import { fetchUser } from '../utils/fetchUser';

const Pin = ({pin: {postedBy, image, _id, destination,save}}) => {
    const [postHovered, setPostHovered] = useState(false);
  

    const navigate = useNavigate();
    const user = fetchUser(); 

    const alreadySaved = !!(save?.filter((item) => item?.postedBy?._id === user?.googleId))?.length;
    // the above line will validate if the user is already saved  so there we are negating the value twice to get the actual result
    const savePin = (id) => {
        if(!alreadySaved) {
            

            client.patch(id)
            .setIfMissing({save: []})
            .insert('after', 'save[-1]', [{
                _key: uuidv4(),
                userId:user?.googleId,
                postedBy: {
                    _type:'postedBy',
                    _ref: user?.googleId,
                },
            }])
            .commit()
            .then(() => {
                window.location.reload();
                
            })
        }
    }
    const deletePin = (id) => {
        client.delete(id)
        .then(()=> {
            window.location.reload();
        })
    }
  return <div className="m-2">
<div 
onMouseEnter={() => setPostHovered(true)}
onMouseLeave={() => setPostHovered(false)}
onClick={() => navigate(`/pin-detail/${_id}`)}
className="relative cursor-zoom-in w-auto hover:shadow-lg overflow-hidden transition-all duration-500 ease-in-out">
    <img className="rounded-lg w-full" alt="user-post" src={urlFor(image).width(250).url()} />
    {postHovered && (
        <div className="absolute top-0 w-full h-full flex flex-col justify-between p-1 pr-2 pt-2 z-50"
        style={{height: '100%'}}>
        <div className="flex items-center justify-between">
        <div className="flex gap-2">
            <a href={`${image?.asset?.url}?dl=`}  
            download onClick={(e) => e.stopPropagation()}
            className="bg-white w-9 h-9 rounded-full flex items-center justify-center text-dark text-xl opacity-75 hover:opacity-100 hover:shadow-md outline-none">
            <MdDownloadForOffline className="text-gray-600 text-lg" />
            </a>
        </div>
        {alreadySaved?  (
            <button type="button" 
            className="bg-red-500 text-white font-bold  text-base px-2 py-1 rounded-3xl hover:shadow-md outline-none"
            >
              {save?.length}  Saved
            </button>
        ): (
            <button type="button"
            className="bg-red-500 text-white font-bold  text-base px-2 py-1 rounded-3xl hover:shadow-md outline-none"
            onClick={(e) => {
                e.stopPropagation()
                savePin(_id);
            } }
            >
                Save
            </button>
        )}
        </div>
        <div className="flex justify-between items-center gap-2 w-full">
            {destination && (
                <a href={destination}
                target="_blank"
                rel="noreferrer"
                className="flex items-center bg-white p-2 font-bold text-black px-4 rounded-full opacity-75 hover:opacity-100 hover:shadow-md outline-none w-4/6 overflow-x-hidden">
                <BsFillArrowRightCircleFill className="text-gray-600 text-sm" />
                {/* {destination.length > 20 ? destination.slice(8, 17): destination.slice(8)} */}
                {destination}
                </a>
            )}
            {postedBy?._id === user?.googleId && (
                <button type="button"
                onClick={(e) => {
                    e.stopPropagation()
                    deletePin(_id);
                } }
                className="bg-white  text-dark font-bold text-base px-2 py-1 rounded-3xl hover:shadow-md outline-none">
                    <AiTwotoneDelete />
                    </button>
            )}
        </div>
            </div>

    )}
 </div>   
    <Link 
    to={`user-profile/${postedBy?._id}`}
    className="flex gap-2 items-center mt-2"
    
    >
    <img 
    className="w-8 h-8 rounded-full object-cover"
    src={postedBy?.image}
    alt="user-profile"
    />
    <p className="font-semibold capitalize">
                {postedBy?.userName}
    </p>
    
    </Link>
  </div>;
};

export default Pin;
