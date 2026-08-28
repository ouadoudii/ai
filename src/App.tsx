import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Heart, Home, Plus, Sparkles, BarChart3, MessageCircle } from 'lucide-react';
import { averageRating, createMoment, toggleFavorite, type Moment } from './utils/moments';

const seed: Moment[] = [
{id:1,title:'Mediterranean Breakfast',meal:'Breakfast',note:'Fresh, simple and energizing.',favorite:true,rating:5,date:'Today, 08:30'},
{id:2,title:'Colorful Lunch Bowl',meal:'Lunch',note:'A balanced bowl with vegetables and grains.',favorite:false,rating:4,date:'Today, 13:10'},
{id:3,title:'Evening Comfort Plate',meal:'Dinner',note:'Warm food and a calm end to the day.',favorite:true,rating:5,date:'Yesterday, 19:40'}];

export default function App(){
 const [tab,setTab]=useState('Today');
 const [moments,setMoments]=useState<Moment[]>(()=>{try{return JSON.parse(localStorage.getItem('nimmapp_moments_v1')||'null')||seed}catch{return seed}});
 const [adding,setAdding]=useState(false);
 const [title,setTitle]=useState('');
 useEffect(()=>localStorage.setItem('nimmapp_moments_v1',JSON.stringify(moments)),[moments]);
 const favs=useMemo(()=>moments.filter(m=>m.favorite),[moments]);
 const shown=tab==='Favorites'?favs:moments;
 const add=()=>{const moment=createMoment(title);if(!moment)return;setMoments([moment,...moments]);setTitle('');setAdding(false)};
 return <div className="app-shell">
  <header className="topbar"><div><div className="eyebrow">CARY · FOOD JOURNEY</div><h1>Eat with care. Remember what matters.</h1></div><button className="avatar">OE</button></header>
  <main>
   {tab==='Today' && <><section className="hero"><div><span className="pill"><Sparkles size={15}/> Daily care</span><h2>How are you feeling around food today?</h2><p>Your private journal for meals, feelings and small discoveries — without judgment.</p><div className="hero-actions"><button onClick={()=>setAdding(true)} className="primary"><Plus size={18}/> Add a moment</button><button className="secondary"><MessageCircle size={18}/> Talk to Food Coach</button></div></div><div className="check"><b>Today’s gentle check-in</b><div className="moods"><span>😊</span><span>😌</span><span>😐</span><span>😕</span></div><small>Choose what feels closest. No score, no pressure.</small></div></section>
   <section className="section-head"><div><span className="eyebrow">YOUR JOURNEY</span><h3>Recent food moments</h3></div><button onClick={()=>setTab('Calendar')}>View calendar</button></section></>}
   {tab==='Coach' && <section className="feature"><Sparkles size={30}/><h2>Your Food Coach</h2><p>Reflect on patterns, hunger, energy and enjoyment. Cary keeps the tone supportive and practical.</p><textarea placeholder="What would you like to talk about?"/><button className="primary">Start reflection</button></section>}
   {tab==='Stats' && <section className="feature"><BarChart3 size={30}/><h2>Your patterns</h2><div className="stats"><div><b>{moments.length}</b><span>moments</span></div><div><b>{favs.length}</b><span>favorites</span></div><div><b>{averageRating(moments)}/5</b><span>avg. joy</span></div></div></section>}
   {tab==='Calendar' && <section className="feature"><CalendarDays size={30}/><h2>Food calendar</h2><p>Your moments are collected here by day. Keep adding memories and the journey grows with you.</p></section>}
   {(tab==='Today'||tab==='Favorites') && <section className="cards">{shown.map(m=><article className="moment" key={m.id}><div className="food-art"><span>{m.meal}</span></div><div className="moment-body"><div className="moment-title"><div><small>{m.date}</small><h4>{m.title}</h4></div><button onClick={()=>setMoments(toggleFavorite(moments,m.id))}><Heart fill={m.favorite?'currentColor':'none'} size={21}/></button></div><p>{m.note}</p><div className="rating">{'★'.repeat(m.rating)}<span>{m.rating}.0</span></div></div></article>)}</section>}
  </main>
  <nav className="bottom-nav">{[['Today',Home],['Calendar',CalendarDays],['Coach',Sparkles],['Favorites',Heart],['Stats',BarChart3]].map(([name,Icon]:any)=><button className={tab===name?'active':''} onClick={()=>setTab(name)} key={name}><Icon size={20}/><span>{name}</span></button>)}</nav>
  <button className="fab" onClick={()=>setAdding(true)}><Plus size={25}/></button>
  {adding&&<div className="modal-bg" onClick={()=>setAdding(false)}><div className="modal" onClick={e=>e.stopPropagation()}><span className="eyebrow">NEW MEMORY</span><h2>Add a food moment</h2><input autoFocus value={title} onChange={e=>setTitle(e.target.value)} placeholder="What did you eat or enjoy?" onKeyDown={e=>e.key==='Enter'&&add()}/><div className="modal-actions"><button onClick={()=>setAdding(false)} className="secondary">Cancel</button><button onClick={add} className="primary">Save moment</button></div></div></div>}
 </div>
}