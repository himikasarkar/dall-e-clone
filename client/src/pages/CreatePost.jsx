import React, {useState, useRef} from 'react'
import { useNavigate } from 'react-router-dom'
import ReCAPTCHA from "react-google-recaptcha"
import emailjs from 'emailjs-com'

import { preview } from '../assets'
import {getRandomPrompt} from '../utils'

import { FormField, Loader } from '../components'

const CreatePost = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    prompt: '',
    photo: ''
  });
  const [generatingImg, setGeneratingImg] = useState(false);
  const [loading, setLoading] = useState(false);
  const recaptchaRef = useRef(null)

  const handleSubmit = async(e) => {
    e.preventDefault();
    const captchaToken = await recaptchaRef.current.executeAsync();
    recaptchaRef.current.reset();
    if(form.prompt && form.photo){
      setLoading(true);
      form['token'] = captchaToken;
      try{
        const response = await fetch('https://dall-e-clone-g2ed.onrender.com/api/v1/post', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(form)
        })

        await response.json();

        //send email 
        const templateParams = {
          from_name: form.name,
          to_name: "Himika",
          prompt: form.prompt
        }
        emailjs.send('service_181jzni','template_q0fiqdb', templateParams, 'W4pKE_wPnDrA45cNl')
        .then((res)=> {
          console.log('Email response: ', res);
        }, (err) => {
          console.log('Email err: ', err);
        })
        navigate('/');
      }catch(err){
        alert(err);
      } finally{
        setLoading(false);
      }
    }
    else{
      alert('Please enter a prompt and generate an image');
    }
  }

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value})
  }
  const handleSurpriseMe = () => {
    const randomPrompt = getRandomPrompt(form.prompt);
    setForm({...form, prompt: randomPrompt})
  }
  const generateImage = async() => {
    if(form.prompt && form.name){
      try {
        setGeneratingImg(true);
        const response = await fetch('https://dall-e-clone-g2ed.onrender.com/api/v1/dalle', {
          method: 'POST',
          headers: {
            'Content-Type':'application/json'
          },
          body: JSON.stringify({prompt: form.prompt})
        })

          const data = await response.json();
          if(data.status != undefined && data.status != 200){
            setForm({
              name: '',
              prompt: '',
              photo: ''
            });
            throw Error('Please try some other prompt!')
          }
          setForm({...form, photo: `data:image/jpeg;base64,${data.photo}`})
      } catch (error) {
        alert(error);
      } finally{
        setGeneratingImg(false);
      }
    }
    else{
      alert("Please enter details");
    }
  }

  const navigateHome = () => {
    navigate('/');
  }

  return (
    <section className='max-w-7xl mx-auto'>
      <div>
        <h1 className='font-entrabold text-[#222328] text-[32px]'>Create</h1>
        <p className='mt-2 text-[#666e75] text-[16px] max-w-[500px]'>Create imaginative and visually stunning images through DALL-E AI and share with the community</p>
      </div> 

      <form className='mt-16 max-w-3xl' onSubmit={handleSubmit}>
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey="6LflzyQlAAAAADCtB1QVVbaPzMkkoOlfTIIdeJYy"
          size="invisible"
        />
        <div className='flex flex-col gap-5'>
          <FormField
            labelName="Your name"
            type="text"
            name="name"
            placeholder="John Doe"
            value={form.name}
            handleChange={handleChange}
            required
          />
          <FormField
            labelName="Prompt"
            type="text"
            name="prompt"
            placeholder="an armchair in the shape of an avocado"
            value={form.prompt}
            isSurpriseMe
            handleChange={handleChange}
            handleSurpriseMe={handleSurpriseMe}
            required
          />
          <div className='relative bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-64 p-3 h-64 flex justify-center items-center'>
            {form.photo ? (
              <img
                src={form.photo}
                alt={form.prompt}
                className="w-full h-full object-contain"
                width="1000"
                height="1000"
              />
            ): (
              <img
                src={preview}
                alt="preview"
                className='w-9/12 h-9/12 object-contain opacity-40'
                width="750"
                height="750"
              />
            )}

            {generatingImg && (
              <div className='absolute inset-0 z-0 flex justify-center items-center bg-[rgba(0,0,0,0,5)] rounded-lg'>
                <Loader/>
              </div>
            )}
          </div>
        </div>

        <div className='mt-5 flex gap-5'>
          <button
            type='button'
            onClick={generateImage}
            // disabled={generatingImg}
            disabled={true}
            className='text-white bg-green-700 font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5 disabled:opacity-70'
          >
            {generatingImg ? 'Generating...' : 'Generate Image'}
          </button>
        </div>
        <div>
        <p className='mt-5 text-xs tracking-wide text-red-400'>Free trial has ended, thanks for your support! &#128156;&#128156;&#128156;</p>
        </div>

        <div className='mt-5'>
          <button onClick={navigateHome} className='mt-3 text-[#6469ff] bg-transparent border border-[#6469ff] font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5 text-center min-w-min'>Back to Community
          </button>
        </div>
      </form>

      
    </section>
  )
}

export default CreatePost