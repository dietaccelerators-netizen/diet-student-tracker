export function StudentGreeting({ name, examDiet, level }: { name: string; examDiet: string; level: string }) {
  const firstName = name.split(" ")[0];
  return (
    <section className="student-hero learning-banner border-b border-[#E4E8E5] pb-8 pt-8 sm:pb-10 sm:pt-12">
      <div className="learning-banner-copy"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.17em] text-[#68716B]">YOUR NEXT CHAPTER</p>
      <h1 className="editorial text-4xl font-medium leading-none text-[#20262B] sm:text-5xl">Let’s make progress, {firstName}.</h1>
      <p className="hero-note">One topic, one practice question, one step closer.</p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#68716B]">
        <span>{examDiet}</span><span aria-hidden="true">•</span><span>{level}</span>
      </div>
      </div><div className="image-slot banner-image" aria-label="Reserved space for a welcome image"><span>WELCOME IMAGE</span><small>Your study story belongs here</small></div>
    </section>
  );
}
