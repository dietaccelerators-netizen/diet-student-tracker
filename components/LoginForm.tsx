"use client";
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { STAGES, SUBJECTS, type ExamStage } from '@/lib/stages';
export function LoginForm({registration=false, recovery=false}: {registration?:boolean; recovery?:boolean}) {
 const [step,setStep]=useState(0), [first,setFirst]=useState(''), [last,setLast]=useState(''), [email,setEmail]=useState('');
 const [stage,setStage]=useState<ExamStage>('Foundation'), [password,setPassword]=useState(''), [confirm,setConfirm]=useState('');
 const [show,setShow]=useState(false), [busy,setBusy]=useState(false), [error,setError]=useState(''), [message,setMessage]=useState('');
 const [method,setMethod]=useState<'password'|'link'|'reset'>('password');
 async function submit(e:FormEvent) {
  e.preventDefault(); setError('');
  if(registration && step<2) {setStep(step+1);return;}
  if((registration || recovery) && password!==confirm) {setError('The passwords do not match.');return;}
  setBusy(true);
  try {
   const client=createClient();
   const redirectTo=`${window.location.origin}/auth/callback`;
   if(recovery) {
    const {error}=await client.auth.updateUser({password}); if(error) throw error;
    window.location.assign('/dashboard'); return;
   }
   if(registration) {
    const readiness = await client.rpc('student_registration_ready');
    if (readiness.error || readiness.data !== true) throw new Error('Student registration is being connected. Please check back shortly. Existing students can still sign in.');
    const {data,error}=await client.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:redirectTo,data:{first_name:first.trim(),last_name:last.trim(),full_name:`${first.trim()} ${last.trim()}`,exam_stage:stage}}});
    if(error) throw error;
    if(data.session) {window.location.assign('/dashboard');return;}
    setMessage('Check your email to confirm your account. Open the confirmation link on this device, then your stage dashboard will open. If you already have an account, sign in or reset your password.');
   } else if(method==='password') {
    const {error}=await client.auth.signInWithPassword({email:email.trim(),password}); if(error) throw error;
    window.location.assign('/dashboard');return;
   } else if(method==='reset') {
    const {error}=await client.auth.resetPasswordForEmail(email.trim(),{redirectTo:`${redirectTo}?next=/login?mode=recovery`}); if(error) throw error;
    setMessage('If this email has an account, a password reset link will arrive shortly. Open it on this device.');
   } else {
    const {error}=await client.auth.signInWithOtp({email:email.trim(),options:{shouldCreateUser:false,emailRedirectTo:redirectTo}}); if(error) throw error;
    setMessage('Check your email for your sign-in link. Open it on this device.');
   }
  } catch(err) {
   const code=(err as {code?:string}).code;
   setError(code==='invalid_credentials' ? 'The email or password is incorrect. Try again or reset your password.' : code==='email_not_confirmed' ? 'Confirm your email before signing in. Check your inbox and spam folder.' : err instanceof Error ? err.message : 'We could not complete this request. Please try again.');
  } finally {setBusy(false);}
 }
 if(message) return <div className="auth-message" role="status"><span className="eyebrow">ONE MORE STEP</span><h2>Check your inbox</h2><p>{message}</p><Link className="primary-button" href="/login">Back to sign in</Link></div>;
 return <form onSubmit={submit} className="account-form">
 {registration && <ol className="enrol-progress" aria-label="Registration progress">{['Your details','Exam stage','Password'].map((label,i)=><li key={label} aria-current={step===i?'step':undefined}><b>{i+1}</b>{label}</li>)}</ol>}
 {registration && step===0 && <><div className="field-pair"><label>First name<input required autoComplete="given-name" value={first} maxLength={60} onChange={e=>setFirst(e.target.value)}/></label><label>Last name<input required autoComplete="family-name" value={last} maxLength={60} onChange={e=>setLast(e.target.value)}/></label></div><label>Email address<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label></>}
 {registration && step===1 && <><fieldset className="stage-picker"><legend>Which stage are you preparing for?</legend>{STAGES.map(s=><label className={stage===s?'stage-option selected':'stage-option'} key={s}><input type="radio" name="stage" value={s} checked={stage===s} onChange={()=>setStage(s)}/><span><b>{s}</b><small>{s.startsWith('ATS')?'ATSWA':'ICAN'} · {SUBJECTS[s].length} subjects</small></span></label>)}</fieldset><div className="stage-preview"><strong>Your {stage} subjects</strong><ul>{SUBJECTS[stage].map(([code,name])=><li key={code}>{name}</li>)}</ul></div></>}
 {!registration && !recovery && <label>Email address<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label>}
 {((registration && step===2) || recovery || (!registration && method==='password')) && <><label>{registration || recovery?'Create a password':'Password'}<div className="password-field"><input type={show?'text':'password'} required minLength={registration||recovery?10:1} autoComplete={registration||recovery?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)}/><button type="button" onClick={()=>setShow(!show)} aria-label={show?'Hide password':'Show password'}>{show?'Hide':'Show'}</button></div></label>{(registration||recovery) && <><p className="field-hint">Use at least 10 characters. A longer, unique password is best.</p><label>Confirm password<input type={show?'text':'password'} required minLength={10} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)}/></label></>}</>}
 {registration && step===2 && <p className="registration-review">{first} {last} · {stage}<br/>{email}<br/>Your subjects will be ready after email confirmation.</p>}
 {error && <p role="alert" className="auth-error">{error}</p>}
 <div className="form-actions">{registration && step>0 && <button type="button" className="secondary-button" disabled={busy} onClick={()=>setStep(step-1)}>Back</button>}<button type="submit" className="primary-button" disabled={busy}>{busy?'Please wait…':recovery?'Save password':registration?(step<2?'Continue →':'Create my account →'):method==='reset'?'Send reset link':method==='link'?'Email my sign-in link':'Sign in →'}</button></div>
 {!registration && !recovery && <div className="login-options"><button type="button" onClick={()=>{setMethod(method==='reset'?'password':'reset');setError('');}}>{method==='reset'?'Sign in with password':'Forgot password?'}</button><button type="button" onClick={()=>{setMethod(method==='link'?'password':'link');setError('');}}>{method==='link'?'Use password instead':'Use an email link'}</button></div>}
 </form>;
}
