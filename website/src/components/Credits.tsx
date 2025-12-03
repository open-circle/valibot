import { component$ } from '@builder.io/qwik';
import { useDocumentHead } from '@builder.io/qwik-city';
import {
  AlgoliaLogo,
  BoltLogo,
  BuilderLogo,
  DigitalOceanLogo,
  HdmLogo,
  LambdaTestLogo,
  MotionLogo,
  PaceLogo,
  StainlessLogo,
  VercelLogo,
} from '~/logos';

/**
 * Displays the contributors of the current page as well as partners and
 * sponsors of the project.
 */
export const Credits = component$(() => {
  const head = useDocumentHead<{ contributors?: string[] }>();
  return (
    <footer class="mx-8 mt-12 border-t-2 border-slate-200 pt-2 md:mt-16 md:pt-4 lg:mx-10 lg:mt-20 lg:pt-6 dark:border-slate-800">
      {!!head.frontmatter.contributors?.length && (
        <>
          <h3 class="mt-10 text-lg font-medium text-slate-900 md:mt-12 md:text-xl lg:mt-14 lg:text-2xl dark:text-slate-200">
            Contributors
          </h3>
          <p class="mt-3 leading-loose md:mt-4 md:text-lg lg:mt-5 lg:text-xl">
            Thanks to all the contributors who helped make this page better!
          </p>
          <ul class="mt-4 flex flex-wrap gap-2 md:mt-5 lg:mt-6 lg:gap-3">
            {head.frontmatter.contributors.map((contributor) => (
              <li key={contributor}>
                <a
                  href={`https://github.com/${contributor}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    width="88"
                    height="88"
                    loading="lazy"
                    src={`https://github.com/${contributor}.png?size=88`}
                    alt={`GitHub profile picture of @${contributor}`}
                    class="w-9 rounded-full md:w-10 lg:w-11"
                  />
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

      <h3 class="mt-10 text-lg font-medium text-slate-900 md:mt-12 md:text-xl lg:mt-14 lg:text-2xl dark:text-slate-200">
        Partners
      </h3>
      <p class="mt-3 leading-loose md:mt-4 md:text-lg lg:mt-5 lg:text-xl">
        Thanks to our partners who support the project ideally and financially.
      </p>
      <ul class="mt-4 flex flex-wrap gap-x-6 gap-y-3 md:mt-5 md:gap-x-8 md:gap-y-4 lg:mt-6 lg:gap-x-10 lg:gap-y-5">
        {[
          { Logo: PaceLogo, href: 'https://www.pace.edu' },
          { Logo: HdmLogo, href: 'https://www.hdm-stuttgart.de' },
          { Logo: BoltLogo, href: 'https://bolt.new/' },
          { Logo: MotionLogo, href: 'https://www.usemotion.com/' },
          { Logo: VercelLogo, href: 'https://vercel.com' },
          { Logo: StainlessLogo, href: 'https://www.stainless.com/' },
          { Logo: LambdaTestLogo, href: 'https://www.lambdatest.com/' },
          { Logo: AlgoliaLogo, href: 'https://www.algolia.com' },
          { Logo: DigitalOceanLogo, href: 'https://www.digitalocean.com/' },
          { Logo: BuilderLogo, href: 'https://www.builder.io' },
        ].map(({ Logo, href }) => (
          <li key={href}>
            <a href={href} target="_blank" rel="noreferrer">
              <Logo class="h-9 md:h-11 lg:h-12" />
            </a>
          </li>
        ))}
      </ul>

      <h3 class="mt-10 text-lg font-medium text-slate-900 md:mt-12 md:text-xl lg:mt-14 lg:text-2xl dark:text-slate-200">
        Sponsors
      </h3>
      <p class="mt-3 leading-loose md:mt-4 md:text-lg lg:mt-5 lg:text-xl">
        Thanks to our GitHub sponsors who support the project financially.
      </p>
      <ul class="mt-4 flex flex-wrap gap-2 md:mt-5 lg:mt-6 lg:gap-3">
        {[
          'antfu',
          'vasilii-kovalev',
          'saturnonearth',
          'ruiaraujo012',
          'hyunbinseo',
          'nickytonline',
          'KubaJastrz',
          'andrewmd5',
          'Thanaen',
          'caegdeveloper',
          'bmoyroud',
          'dslatkin',
        ].map((sponsor) => (
          <li key={sponsor}>
            <a
              href={`https://github.com/${sponsor}`}
              target="_blank"
              rel="noreferrer"
            >
              <img
                width="88"
                height="88"
                loading="lazy"
                src={`https://github.com/${sponsor}.png?size=88`}
                alt={`GitHub profile picture of @${sponsor}`}
                class="w-9 rounded-full md:w-10 lg:w-11"
              />
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
});
