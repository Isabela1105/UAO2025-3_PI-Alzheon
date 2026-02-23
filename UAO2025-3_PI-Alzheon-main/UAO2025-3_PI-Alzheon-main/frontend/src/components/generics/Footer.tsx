export const Footer = () => {
  const backgroundImage = "/backgroundfooter.jpg"
  const logoImage = "/alzheon.png"

  return (
    <footer className="relative h-[200px] bg-[#13172b]">
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src={backgroundImage} 
          alt="Background" 
          className="blur-xl absolute h-[271.7%] left-0 max-w-none top-[-171.68%] w-full object-cover"
        />
      </div>
      
      <div className="relative flex items-start justify-between h-full px-[40px] pt-[20px]">
        {/* Logo Section */}
        <div className='flex items-center gap-1'>
          <div className="w-[50px] h-[48px]">
            <img 
              src={logoImage} 
              alt="Alzheon Logo" 
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div className="flex-column items-center">
            <h3 className="font-bold text-white text-xl">Alzheon</h3>
            <p className="text-white/70 text-xs ml-1">Alzheimer's awareness</p>
          </div>
        </div>

        {/* Seccion de Creadores */}
        <div className="relative">
          {/* liquid glass fondo */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-2xl rounded-[40px] border border-white/20">
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-white/5 rounded-[40px]"></div>
          </div>
          
          <div className="relative flex flex-col justify-center px-6 py-4 h-[160px] text-center">
            <h4 className="font-semibold text-[18px] text-black mb-3 text-center">Creadores</h4>
            <div className="font-medium text-[10px] text-black leading-normal space-y-1">
              <p>Daniel Sanchez Collazos</p>
              <p>Alejandro Solarte Gaitán</p>
              <p>Juan José Gómez Oviedo</p>
              <p>José Daniel Arango Reina</p>
              <p>Samuel Moreno Mancera</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
