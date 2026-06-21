export function ProfileRememberWaveSvg() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 393 55" fill="none">
      <path
        d="M-128.834 113.142C-56.0212 113.784 -22.3531 73.6311 -45.5313 64.1334C-73.3447 52.7364 -11.7611 39.4134 12.5795 24.8733C46.2416 4.76494 127.712 6.32484 178.627 15.493C317.507 40.5007 390.2 -17.6409 482.2 7.85375"
        stroke="#1952FF"
        strokeWidth="2.47"
        strokeDasharray="8 8"
      />
    </svg>
  );
}

export default function ProfileRememberWave() {
  return (
    <section className="profile-section profile-remember" aria-hidden="true">
      <ProfileRememberWaveSvg />
    </section>
  );
}
