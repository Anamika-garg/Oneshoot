"use client";
import { motion } from "framer-motion";
import { FadeInWhenVisible } from "./ui/FadeInWhenVisible";


const svgPaths = [
  `<path d='M40.8544 32.5885C40.4012 33.0469 40.193 33.7099 40.2962 34.3601L41.8518 43.3462C41.983 44.1079 41.675 44.8786 41.0644 45.3188C40.4659 45.7754 39.6698 45.8302 39.0171 45.4649L31.2674 41.2458C30.9979 41.0961 30.6987 41.0157 30.3925 41.0066H29.9183C29.7538 41.0321 29.5929 41.0869 29.4459 41.1709L21.6944 45.4101C21.3112 45.611 20.8773 45.6823 20.4521 45.611C19.4162 45.4065 18.725 44.3764 18.8948 43.2896L20.4521 34.3035C20.5553 33.6478 20.3471 32.9812 19.8939 32.5154L13.5755 26.1229C13.047 25.5877 12.8633 24.7841 13.1048 24.059C13.3392 23.3357 13.9377 22.8079 14.6603 22.6892L23.3567 21.3724C24.0181 21.3011 24.599 20.881 24.8965 20.2601L28.7285 12.0593C28.8195 11.8767 28.9367 11.7087 29.0784 11.5662L29.2359 11.4383C29.3182 11.3434 29.4126 11.2648 29.5176 11.2009L29.7084 11.1279L30.0058 11H30.7425C31.4004 11.0712 31.9796 11.4822 32.2823 12.0959L36.165 20.2601C36.445 20.8573 36.9892 21.2719 37.6173 21.3724L46.3137 22.6892C47.0486 22.7988 47.6628 23.3284 47.906 24.059C48.1352 24.7914 47.9375 25.5951 47.3985 26.1229L40.8544 32.5885Z' fill='#E39530'/><rect width='60' height='60' rx='30' fill='#FFB528' opacity='0.15'/>`,
  `<path fillRule='evenodd' clipRule='evenodd' d='M29.5201 47.8447C29.7156 47.9488 29.9341 48.0018 30.1527 48C30.3712 47.9983 30.5879 47.9435 30.7851 47.8376L37.0814 44.4044C38.8668 43.4337 40.265 42.3482 41.3558 41.0843C43.7276 38.3308 45.0227 34.8165 44.9997 31.1928L44.925 19.2396C44.918 17.8628 44.0314 16.6343 42.7202 16.1877L31.0071 12.1792C30.3019 11.9356 29.5291 11.9409 28.8362 12.1916L17.1675 16.3431C15.8635 16.8073 14.9929 18.0446 15 19.4231L15.0747 31.3675C15.0978 34.9965 16.4373 38.4949 18.8481 41.2202C19.9496 42.4664 21.3603 43.5361 23.1653 44.491L29.5201 47.8447ZM27.8534 33.7961C28.1163 34.0539 28.4575 34.1809 28.7985 34.1774C29.1396 34.1756 29.479 34.045 29.7383 33.7838L36.6191 26.8647C37.1361 26.3439 37.1308 25.5072 36.6084 24.9935C36.0843 24.48 35.2404 24.4835 34.7235 25.0042L28.779 30.9808L26.345 28.5943C25.821 28.0808 24.9788 28.0861 24.4601 28.6067C23.9431 29.1275 23.9484 29.9641 24.4725 30.4777L27.8534 33.7961Z' fill='#E39530'/><rect width='60' height='60' rx='30' fill='#FFB528' opacity='0.15'/>`,
  `<path d='M44.0683 15.9021C43.243 15.1063 42.0215 14.8099 40.8826 15.1219L14.3232 22.3773C13.1215 22.6909 12.2698 23.5912 12.0403 24.7349C11.8059 25.8988 12.6246 27.3765 13.6943 27.9943L21.9989 32.7891C22.8506 33.2805 23.9499 33.1573 24.6548 32.4895L34.1643 23.5007C34.643 23.0326 35.4353 23.0326 35.914 23.5007C36.3927 23.9531 36.3927 24.6865 35.914 25.1545L26.388 34.1449C25.6815 34.8112 25.5495 35.8488 26.0694 36.6539L31.1436 44.5333C31.7378 45.4695 32.7612 46 33.8837 46C34.0157 46 34.1643 46 34.2963 45.9844C35.5839 45.8283 36.6074 45.0014 36.987 43.8312L44.8607 18.9134C45.2074 17.8524 44.8938 16.6978 44.0683 15.9021Z' fill='#E39530'/><rect width='60' height='60' rx='30' fill='#FFB528' opacity='0.15'/>`,
];

const features = [
  "High-Quality Content",
  "Fast and Responsive Support",
  "Exceptional Customer Experience",
];

const stats = [
  { value: "3000+", label: "completed orders" },
  { value: "230+", label: "reviews" },
  { value: "24/7", label: "support online" },
];

export function Stats() {
  return (
    <section className='py-20 relative overflow-x-clip'>
      <div className='container px-4 mx-auto'>
        <FadeInWhenVisible>
          <h2 className='text-2xl md:text-xl font-manrope uppercase font-semibold bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent mb-4 md:mb-2'>
            Why Go with Us
          </h2>
        </FadeInWhenVisible>

        <div className='flex flex-col md:flex-row justify-between items-start md:items-center'>
          <div className='flex flex-col gap-8 md:gap-16 max-w-2xl w-full py-10'>
            <FadeInWhenVisible delay={0.1}>
              <p className='text-2xl md:text-3xl font-bold text-white tracking-wider font-manrope'>
                At OneShot, we are dedicated to delivering an exceptional
                customer experience, ensuring maximum value for your investment.
              </p>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.2}>
              <p className='text-base font-light text-white tracking-wider font-manrope'>
                With a focus on excellence, we provide only high-quality content
                and fast, reliable support as your trusted partner.
              </p>
            </FadeInWhenVisible>
          </div>

          <div className='flex flex-col gap-10 md:gap-14 max-w-2xl w-full items-center md:items-end mt-8 md:mt-0 relative z-10'>
            {features.map((text, index) => (
              <FadeInWhenVisible key={index} delay={0.3 + index * 0.1}>
                <div className='flex items-center max-w-2xl gap-4 md:gap-5'>
                  <svg
                    width='60'
                    height='60'
                    viewBox='0 0 60 60'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                    className='flex-shrink-0'
                    dangerouslySetInnerHTML={{ __html: svgPaths[index] }}
                  />
                  <p className='text-lg md:text-xl font-medium text-white tracking-wider font-manrope w-56'>
                    {text}
                  </p>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>

        <div className='flex flex-col md:flex-row items-center gap-y-8 md:gap-x-24 mx-auto justify-center mt-16 md:mt-24'>
          {stats.map(({ value, label }, index) => (
            <FadeInWhenVisible key={index} delay={0.6 + index * 0.1}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className='font-inter text-3xl md:text-4xl font-extrabold text-white tracking-wider flex items-center gap-3 md:gap-4 relative z-10'
              >
                {value}
                <span className='text-base md:text-xl font-manrope uppercase font-semibold bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent pt-1'>
                  {label}
                </span>
              </motion.div>
            </FadeInWhenVisible>
          ))}
        </div>
      </div>

      <FadeInWhenVisible delay={0.8}>
        <div className='absolute bottom-1/2 md:bottom-20 -right-20 md:-right-40 h-80 md:h-[320px] w-80 md:w-[320px] rounded-full blur-[220px] md:blur-[200px] pointer-events-none bg-orange z-0' />
      </FadeInWhenVisible>
    </section>
  );
}
