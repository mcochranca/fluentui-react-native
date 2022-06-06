import { useMenuContext } from '../context/menuContext';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { MenuTriggerState } from './MenuTrigger.types';
import { AccessibilityActionEvent, AccessibilityActionName, Platform } from 'react-native';
import React from 'react';
import { delayHover, isCloseOnHoverOutEnabled } from '../consts';

const accessibilityActions =
  Platform.OS === ('win32' as any) ? [{ name: 'Expand' as AccessibilityActionName }, { name: 'Collapse' as AccessibilityActionName }] : [];
const expandedState = { expanded: true };
const collapsedState = { expanded: false };

export const useMenuTrigger = (): MenuTriggerState => {
  const context = useMenuContext();
  const { open, openOnHover, popoverHoverOutTimer, setOpen, setTriggerHoverOutTimer, triggerHoverOutTimer, triggerRef } = context;

  const accessibilityState = open ? expandedState : collapsedState;

  const onAccessibilityAction = React.useCallback(
    (e: AccessibilityActionEvent) => {
      if (Platform.OS === ('win32' as any)) {
        switch (e.nativeEvent.actionName) {
          case 'Expand':
            setOpen(e, true /* isOpen */);
            break;

          case 'Collapse':
            setOpen(e, false /* isOpen */);
            break;
        }
      }
    },
    [setOpen],
  );

  const onHoverIn = React.useCallback(
    (e: InteractionEvent) => {
      if (openOnHover) {
        clearTimeout(popoverHoverOutTimer);
        clearTimeout(triggerHoverOutTimer);
        setTimeout(() => {
          setOpen(e, true /* isOpen */);
        }, delayHover);
      }
    },
    [openOnHover, setOpen, triggerHoverOutTimer, popoverHoverOutTimer],
  );

  const onHoverOut = React.useCallback(
    (e: InteractionEvent) => {
      if (openOnHover) {
        const timer = setTimeout(() => {
          setOpen(e, false /* isOpen */);
        }, delayHover);
        setTriggerHoverOutTimer(timer);
      }
    },
    [openOnHover, setOpen, setTriggerHoverOutTimer],
  );

  const onClick = React.useCallback(
    (e: InteractionEvent) => {
      setOpen(e, !open);
    },
    [open, setOpen],
  );

  return {
    props: {
      onClick,
      onHoverIn,
      onHoverOut: isCloseOnHoverOutEnabled && onHoverOut,
      componentRef: triggerRef,
      accessibilityState,
      accessibilityActions,
      onAccessibilityAction,
    },
    hasSubmenu: context.isSubmenu,
  };
};
