import * as React from 'react';
import { Add20Regular } from '@fluentui/react-icons';
import { makeStyles } from '@fluentui/react-make-styles';
import { Checkbox, Dropdown, IDropdownOption, TextField } from './tmp-components.stories';
import type { PlaygroundProps } from './Playground.types.stories';

const tableStyle: React.CSSProperties = {
  border: '1px solid black',
};
const cellStyle: React.CSSProperties = {
  border: '1px solid black',
  padding: '5px',
};

const useStyles = makeStyles({
  stack: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    width: 'auto',
    height: 'auto',
    boxSizing: 'border-box',
    justifyContent: 'center',
  },

  checkbox: {
    position: 'relative',
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: '20px',
    width: '20px',
    border: `1px solid rgb(50, 49, 48)`,
    borderRadius: '2px',
    boxSizing: 'border-box',
    transitionProperty: 'background, border, border-color',
    transitionDuration: '200ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.23, 1)',
    overflow: 'hidden',
    marginRight: '4px',
  },
});

export const Playground = function <TType>(props: PlaygroundProps<TType>): JSX.Element {
  const { children, sections } = props;
  const styles = useStyles();

  const [componentProps, setComponentProps] = React.useState<{ [key in string]: boolean | string } | null>(null);
  const newProps: { [key in string]: boolean | string } = {};

  const playgroundSections: JSX.Element[] = [];

  let booleanValueChanged = false;

  for (const section of sections) {
    const sectionList: JSX.Element[] = [];
    for (const prop of section.propList) {
      const propName = prop.propName as string;
      const propType = prop.propType;
      let isPropEnabled = true;

      if (componentProps && prop.dependsOnProps) {
        for (const dependentProp of prop.dependsOnProps as string[]) {
          isPropEnabled =
            isPropEnabled &&
            (dependentProp[0] === '~' ? !componentProps[dependentProp.substr(1)] : !!componentProps[dependentProp]);
        }
      }

      if (propType === 'boolean') {
        newProps[propName + 'Default'] = prop.defaultValue || false;
        const propDefaultValueChanged =
          componentProps &&
          prop.defaultValue !== undefined &&
          prop.defaultValue !== componentProps[propName + 'Default'];
        const propEnabledValueChanged =
          componentProps && componentProps[propName] !== (componentProps[propName] && isPropEnabled);
        newProps[propName] =
          componentProps && componentProps[propName] !== 'undefined' && !propDefaultValueChanged
            ? componentProps[propName] && isPropEnabled
            : newProps[propName + 'Default'];

        if (propDefaultValueChanged || propEnabledValueChanged) {
          prop.setDefaultValue?.(newProps[propName] as boolean);
          booleanValueChanged = true;
        }

        const onBooleanPropChange = (ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
          const newComponentProps: { [key in string]: boolean | string } = {
            ...componentProps,
          };
          newComponentProps[propName] = checked || false;
          setComponentProps(newComponentProps);
          prop.setDefaultValue?.(checked || false);
        };

        sectionList.push(
          <tr key={section.sectionName + '_' + propName}>
            <td style={cellStyle}>{propName}:</td>
            <td style={cellStyle}>
              <Checkbox
                checked={
                  componentProps && componentProps[propName] !== undefined && !propDefaultValueChanged
                    ? (componentProps[propName] as boolean)
                    : (prop.defaultValue as boolean)
                }
                disabled={!isPropEnabled}
                onChange={onBooleanPropChange}
                styles={styles.checkbox}
              />
            </td>
          </tr>,
        );
      } else if (propType === 'string') {
        newProps[propName] = (componentProps && componentProps[propName]) || prop.defaultValue || '';

        const onStringPropChange = (
          ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
          newValue?: string,
        ) => {
          const newComponentProps: { [key in string]: boolean | string } = {
            ...componentProps,
          };
          newComponentProps[propName] = newValue || '';
          setComponentProps(newComponentProps);
        };

        sectionList.push(
          <tr key={section.sectionName + '_' + propName}>
            <td style={cellStyle}>{propName}:</td>
            <td style={cellStyle}>
              <TextField
                value={
                  componentProps && componentProps[propName] !== undefined
                    ? (componentProps[propName] as string)
                    : (prop.defaultValue as string)
                }
                disabled={!isPropEnabled}
                onChange={onStringPropChange}
              />
            </td>
          </tr>,
        );
      } else {
        const defaultSelectedKey = prop.defaultValue || propType[0];
        newProps[propName] = (componentProps && componentProps[propName]) || prop.defaultValue || propType[0];

        const onOptionsPropChange = (
          ev?: React.FormEvent<HTMLSelectElement>,
          option?: IDropdownOption,
          index?: number,
        ) => {
          const newComponentProps: { [key in string]: boolean | string } = {
            ...componentProps,
          };
          if (option) {
            newComponentProps[propName] = (option.key as string) || '';
            setComponentProps(newComponentProps);
          }
        };

        sectionList.push(
          <tr key={section.sectionName + '_' + propName}>
            <td style={cellStyle}>{propName}:</td>
            <td style={cellStyle}>
              <Dropdown
                disabled={!isPropEnabled}
                selectedKey={
                  componentProps && componentProps[propName]
                    ? (componentProps[propName] as string)
                    : (defaultSelectedKey as string)
                }
                options={propType.map(value => ({ key: value, text: value }))}
                onChange={onOptionsPropChange}
              />
            </td>
          </tr>,
        );
      }
    }
    playgroundSections.push(
      <React.Fragment key={section.sectionName}>
        <tr>
          <td style={cellStyle} colSpan={2}>
            <text>{section.sectionName}</text>
          </td>
        </tr>
        {sectionList}
      </React.Fragment>,
    );
  }

  if (componentProps === null || booleanValueChanged) {
    setComponentProps(newProps);
  }

  const elementProps = {
    ...componentProps,
    appearance: componentProps && componentProps.appearance ? componentProps.appearance : undefined,
    children: componentProps && !componentProps.iconOnly && !componentProps.children && componentProps.content,
    icon: componentProps && componentProps.icon ? <Add20Regular /> : undefined,
  };

  return (
    <>
      <div className={styles.stack}>{React.cloneElement(children, elementProps || {})}</div>
      <table style={tableStyle} cellSpacing={0}>
        <tbody>{playgroundSections}</tbody>
      </table>
    </>
  );
};
