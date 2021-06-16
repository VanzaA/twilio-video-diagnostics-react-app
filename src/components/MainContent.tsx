import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core';
import { ActivePane, useAppStateContext } from './AppStateProvider';
import { GetStarted } from './panes/GetStarted/GetStarted';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      position: 'fixed',
      top: '0',
      left: '50%',
      transform: 'translateX(-50%)',
    },
    scrollContainer: {
      transition: 'all 1s ease',
      position: 'relative',
      transform: 'translateY(50vh)',
      '& .inactive': {
        opacity: 0.2,
        userSelect: 'none',
        cursor: 'pointer',
      },
    },
    hideAll: {
      '& .inactive': {
        opacity: 0,
        visibility: 'hidden',
      },
    },
    item: {
      transition: 'all 1s ease',
      padding: '3em 0',
    },
  })
);

function Item({ children, isActive, onClick }) {
  const theme = useTheme();
  const classes = useStyles();
  const ref = useRef<HTMLDivElement>();

  useEffect(() => {
    if (isActive) {
      const el = ref.current;
      const offset = el.offsetTop + el.offsetHeight * 0.5;
      el.parentElement.style.transform = `translateY(calc(50vh - ${offset}px + ${theme.navHeight / 2}px))`;
    }
  }, [isActive, theme.navHeight]);

  return (
    <div
      ref={ref}
      className={clsx(classes.item, { inactive: !isActive })}
      onClick={!isActive && onClick}
      aria-hidden={!isActive}
    >
      {children}
    </div>
  );
}

const content = [
  { pane: ActivePane.GetStarted, component: <GetStarted /> },
  { pane: ActivePane.DeviceSetup, component: <GetStarted /> },
  { pane: ActivePane.Connectivity, component: <GetStarted /> },
  { pane: ActivePane.Quality, component: <GetStarted /> },
  { pane: ActivePane.Results, component: <GetStarted /> },
];

export function MainContent() {
  const classes = useStyles();
  const { activePane, setActivePane } = useAppStateContext();

  return (
    <div className={classes.container}>
      <div
        className={clsx(classes.scrollContainer, {
          [classes.hideAll]: activePane === 0,
        })}
      >
        {content.map((pane, i) => (
          <Item key={i} isActive={activePane === pane.pane} onClick={() => setActivePane(pane.pane)}>
            {pane.component}
          </Item>
        ))}
      </div>
    </div>
  );
}
