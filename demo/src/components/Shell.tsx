import {
  Avatar, Badge, Button, Menu, MenuDivider, MenuItem, MenuList, MenuPopover, MenuTrigger, Tooltip,
} from '@fluentui/react-components';
import {
  ArrowReset20Regular, Chat20Regular, CalendarLtr20Regular, Code20Regular, Database20Regular, Document20Regular,
  Mail20Regular, Navigation20Regular, Organization20Regular, People20Regular, PersonSwap20Regular, Shield20Regular,
  Sparkle20Regular, Target20Regular, BotSparkle20Regular, HatGraduation20Regular, MailInbox20Regular, Bot20Regular,
} from '@fluentui/react-icons';
import { useState, type ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { canUse, isAdmin, levelsFor, rolesOf, topLevel, visibleNominations } from '../lib/access';
import { useDemo, useViewer } from '../lib/store';

interface Item { to: string; label: string; icon: ReactNode; show: boolean; end?: boolean }

export default function Shell() {
  const { state, update, reset } = useDemo();
  const me = useViewer();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const uid = me.id;
  const admin = isAdmin(state, uid);
  const roles = rolesOf(state, uid).filter((r) => !r.everyone);
  const hasLeads = visibleNominations(state, uid).length > 0;

  const sections: { title?: string; items: Item[] }[] = [
    {
      items: [
        { to: '/', label: 'AI Assistant', icon: <BotSparkle20Regular />, show: true, end: true },
        { to: '/digest', label: 'My daily digest', icon: <MailInbox20Regular />, show: true },
      ],
    },
    {
      title: 'Insights',
      items: [
        { to: '/people', label: 'People & activity', icon: <People20Regular />, show: topLevel(levelsFor(state, uid, 'entra')) !== 'own' && canUse(state, uid, 'entra') },
        { to: '/leads', label: 'Leads', icon: <Target20Regular />, show: hasLeads },
        { to: '/nominations', label: 'Nomination AI', icon: <Sparkle20Regular />, show: hasLeads },
      ],
    },
    {
      title: 'Data explorers',
      items: [
        { to: '/explore/directory', label: 'Directory', icon: <Organization20Regular />, show: canUse(state, uid, 'entra') },
        { to: '/explore/email', label: 'Email', icon: <Mail20Regular />, show: canUse(state, uid, 'email') },
        { to: '/explore/teams', label: 'Teams', icon: <Chat20Regular />, show: canUse(state, uid, 'teams') },
        { to: '/explore/devops', label: 'DevOps', icon: <Code20Regular />, show: canUse(state, uid, 'devops') },
        { to: '/explore/leave', label: 'Leave', icon: <CalendarLtr20Regular />, show: canUse(state, uid, 'leave') },
        { to: '/explore/documents', label: 'Documents', icon: <Document20Regular />, show: canUse(state, uid, 'sharepoint') || canUse(state, uid, 'onedrive') },
        { to: '/explore/learning', label: 'Learning (UCLMS)', icon: <HatGraduation20Regular />, show: canUse(state, uid, 'uclms') },
      ],
    },
    {
      title: 'Admin',
      items: [
        { to: '/admin/sources', label: 'Data sources', icon: <Database20Regular />, show: admin },
        { to: '/admin/roles', label: 'Roles & access', icon: <Shield20Regular />, show: admin },
        { to: '/admin/agents', label: 'AI agents', icon: <Bot20Regular />, show: admin },
      ],
    },
  ];

  return (
    <div className="shell">
      <header className="topbar">
        <Button className="menu-btn" appearance="transparent" icon={<Navigation20Regular />} onClick={() => setOpen(!open)} aria-label="Menu" />
        <div className="brand">
          <BotSparkle20Regular />
          <span><span className="brand-prefix">UnifyCloud </span><b>Second Brain</b></span>
          <Badge appearance="filled" color="warning" size="small">DEMO</Badge>
        </div>
        <div style={{ flex: 1 }} />
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <button className="me-btn">
              <span className="me-text">
                <span>{me.name}</span>
                <small>{roles.length ? roles.map((r) => r.name).join(', ') : 'Employee'}</small>
              </span>
              <Avatar name={me.name} size={32} color="colorful" />
            </button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem icon={<PersonSwap20Regular />} onClick={() => { update((s) => ({ ...s, userId: null })); navigate('/login'); }}>
                Switch demo user
              </MenuItem>
              <MenuDivider />
              <Tooltip content="Undo all changes made in the demo (data sources, roles, approvals)" relationship="description">
                <MenuItem icon={<ArrowReset20Regular />} onClick={reset}>Reset demo data</MenuItem>
              </Tooltip>
            </MenuList>
          </MenuPopover>
        </Menu>
      </header>

      <nav className={`sidebar ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
        {sections.map((sec, i) => {
          const items = sec.items.filter((x) => x.show);
          if (!items.length) return null;
          return (
            <div key={i}>
              {sec.title && <div className="nav-section">{sec.title}</div>}
              {items.map((it) => (
                <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  {it.icon}
                  <span>{it.label}</span>
                </NavLink>
              ))}
            </div>
          );
        })}
        <div className="nav-foot">Demo · mock data · simulated AI</div>
      </nav>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
