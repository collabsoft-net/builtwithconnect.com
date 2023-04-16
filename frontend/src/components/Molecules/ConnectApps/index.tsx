
import DynamicTable from '@atlaskit/dynamic-table';
import { Column, Grid, IconWithLabel, Row, withProps } from '@collabsoft-net/components';
import React, { SyntheticEvent, useEffect, useState } from 'react';
import kernel from 'API/kernel';
import { RestClientService } from 'API/services/RestClientService';
import Injectables from 'API/Injectables';
import { AppDTO } from 'API/dto/AppDTO';
import { HeadType, RowType } from '@atlaskit/dynamic-table/dist/types/types';
import Avatar from '@atlaskit/avatar';
import CheckIcon from '@atlaskit/icon/glyph/check';
import SearchIcon from '@atlaskit/icon/glyph/search';
import { camelCase, isNullOrEmpty } from '@collabsoft-net/helpers';
import TextField from '@atlaskit/textfield';
import { colors } from '@atlaskit/theme';
import Select from '@atlaskit/select';
import { Field } from '@atlaskit/form';
import Spinner from '@atlaskit/spinner';
import Pagination from '@atlaskit/pagination';
import ClearIcon from '@atlaskit/icon/glyph/cross';
import { LoadingButton as Button } from '@atlaskit/button';
import styled from 'styled-components';

const PAGINATION_LIMIT = 50;

const QueryColumn = withProps<{ focussed?: boolean }>()(styled(Column))`
  width: ${props => props.focussed ? '214px' : '150px' };
  transition: all 0.3s cubic-bezier(0.15, 1, 0.3, 1) 0s;
`;

const createHead = () => {
  const head: HeadType = {
    cells: []
  };

  head.cells.push({
    key: 'ICON',
    content: '',
    width: 1
  });

  head.cells.push({
    key: 'name',
    content: `Name`,
    isSortable: true
  });

  head.cells.push({
    key: 'partner',
    content: `Partner`,
    isSortable: true
  });

  head.cells.push({
    key: 'hosting',
    content: `Hosting`,
    isSortable: true
  });

  head.cells.push({
    key: 'host',
    content: `Host`,
    isSortable: true
  });

  head.cells.push({
    key: 'paid',
    content: `Paid via Atlassian`,
    isSortable: true
  });

  head.cells.push({
    key: 'scopes',
    content: `# of Scopes`,
    isSortable: true
  });

  head.cells.push({
    key: 'installs',
    content: `# of Installs`,
    isSortable: true
  });

  head.cells.push({
    key: 'users',
    content: `# of Users`,
    isSortable: true
  });

  return head;
};

const createRows = (apps: Array<AppDTO>) => {
  return apps.map((app) => {
    const row: RowType = {
      key: `row_${app.id}`,
      cells: []
    };

    row.cells.push({
      key: `${app.id}-logo`,
      content: <Avatar size='small' appearance='square' src={ `https://marketplace-cdn.atlassian.com/files/${app.logoId}?fileType=image&mode=full-fit` } />
    });

    row.cells.push({
      key: app.name,
      content: <a href={`https://marketplace.atlassian.com/apps/${app.id}?tab=overview&hosting=cloud`} target="_blank">{app.name}</a>
    });

    row.cells.push({
      key: app.partnerName,
      content: <a href={`https://marketplace.atlassian.com/vendors/${app.partnerId}`} target="_blank">{app.partnerName}</a>
    });

    row.cells.push({
      key: app.hosting.map(item => camelCase(item).replace('Data_center', 'Data Center')).join(', '),
      content: app.hosting.map(item => camelCase(item).replace('Data_center', 'Data Center')).join(', ')
    });

    row.cells.push({
      key: app.host.map(camelCase).join(', '),
      content: app.host.map(camelCase).join(', ')
    });

    row.cells.push({
      key: app.isPaid ? 'true' : 'false',
      content: app.isPaid && <CheckIcon label="Paid via Atlassian" />
    });

    row.cells.push({
      key: app.scopes?.length || 0,
      content: app.scopes?.length || 0
    });

    row.cells.push({
      key: app.totalInstalls || 0,
      content: app.totalInstalls || 0
    });

    row.cells.push({
      key: app.totalUsers || 0,
      content: app.totalUsers || 0
    });

    return row;
  });
};

const hostingOptions = [
  { label: 'All', value: '' },
  { label: 'Only Cloud', value: 'CLOUD' },
  { label: 'Multiple platforms', value: 'SERVER' }
];

const paymentOptions = [
  { label: 'All', value: '' },
  { label: 'Paid', value: 'true' },
  { label: 'Free', value: 'false' },
];

const hostOptions = [
  { label: 'All', value: '' },
  { label: 'Jira', value: 'jira' },
  { label: 'Confluence', value: 'confluence' },
];

export const ConnectApps = () => {

  const [ service ] = useState(kernel.get<RestClientService>(Injectables.RestClientService));

  const [ apps, setApps ] = useState<Array<AppDTO>>([]);
  // const [ displayedApps, setDisplayedApps ] = useState<Array<AppDTO>>([]);

  const [ totalApps, setTotalApps ] = useState<number>();
  const [ totalSearchResults, setTotalSearchResults ] = useState<number>();
  const [ totalPages, setTotalPages ] = useState<Array<number>>([]);
  const [ selectedPage, setSelectedPage ] = useState<number>();
  const [ sortKey, setSortKey ] = useState<string>('name');
  const [ sortOrder, setSortOrder ] = useState<'asc'|'desc'>('asc');

  const [ isLoading, setLoading ] = useState<boolean>(true);
  const [ isFetching, setFetching ] = useState<boolean>(true);

  const [ filter, setFilter ] = useState<string>('');
  const [ focusOnFilter, setFocusOnFilter ] = useState<boolean>(false);
  const [ waitForInputTimerId, setWaitForInputTimerId ] = useState<number>();

  const [ host, setHost ] = useState<string>('');
  const [ hosting, setHosting ] = useState<string>('');
  const [ payment, setPayment ] = useState<string>('');

  useEffect(() => {
    fetch().then(() => setLoading(false));
  }, [ service ]);

  useEffect(() => {
    if (totalSearchResults) {
      const pageCount = Math.ceil(totalSearchResults / PAGINATION_LIMIT);
      const pages = [...Array(pageCount)].map((_: unknown, index: number) => index + 1);
      setTotalPages(pages);
      setSelectedPage(pages[0]);
    }
  }, [ totalSearchResults ]);

  useEffect(() => {
    if (!isNullOrEmpty(filter)) {
      window.clearTimeout(waitForInputTimerId);
      const newTimer = window.setTimeout(() => fetch(sortKey, sortOrder), 1000);
      setWaitForInputTimerId(newTimer);
    } else {
      fetch(sortKey, sortOrder);
    }
  }, [ filter ]);

  useEffect(() => {
    fetch(sortKey, sortOrder);
  }, [ selectedPage, payment, host, hosting ]);

  const fetch = async (orderBy: string = 'name', direction: 'asc'|'desc' = 'asc') => {
    setFetching(true);

    return service.search<AppDTO>({
      body: {
        query: filter,
        page: {
          size: PAGINATION_LIMIT, 
          current: selectedPage
        },
        sort: [
          { [orderBy]: direction },
          ...(orderBy !== 'name') ? [{
            'name': 'asc' as 'asc'
          }] : []
        ],
        filters: {
          all: [
            ...!isNullOrEmpty(payment) ? [ { any: [{ 'paid': payment }] } ] : [],
            ...!isNullOrEmpty(host) ? [ { any: [{ 'host': host }] } ] : [],
            ...!isNullOrEmpty(hosting) ? 
              hosting === 'CLOUD' 
                ? [ { none: [{ 'hosting': 'SERVER' }, { 'hosting': 'DATA_CENTER' }] } ]
                : [ { any: [{ 'hosting': 'CLOUD' }, { 'hosting': 'SERVER' }, { 'hosting': 'DATA_CENTER' }] } ]
              : []
          ]
        }
      }
    }).then(({ values, total }) => {
      setApps(values);
      if (!totalApps) {
        setTotalApps(total);
      }
      setTotalSearchResults(total);
      setSortKey(orderBy);
      setSortOrder(direction);
    }).finally(() => setFetching(false));
  }

  const clearFilter = () => {
    setFetching(true);
    setFilter('');
    setFocusOnFilter(false);
  }

  return (
    <Grid fluid padding="16px 20px">
      <Row>
        <Grid fluid vertical>
          <QueryColumn width='150px' margin='0 8px 0 0' focussed={ focusOnFilter }>
            <Field name='search' label='Search'>
              {() => 
                  <TextField
                    value={ filter }
                    onFocus={ () => setFocusOnFilter(true) }
                    onBlur={ () => isNullOrEmpty(filter) && setFocusOnFilter(false) }
                    onChange={ ({ currentTarget: { value }}) => setFilter(value) }
                    elemAfterInput={ isNullOrEmpty(filter)
                      ? <IconWithLabel src={<SearchIcon label='search' size='small' primaryColor={ colors.N300 } secondaryColor={ colors.N0 } />} align='center' margin='0 4px 0 0'>&nbsp;</IconWithLabel>
                      : <IconWithLabel src={ <Button spacing='none' appearance='subtle-link' onClick={ clearFilter } iconBefore={ <ClearIcon label='clear' size='small' primaryColor={ colors.N300 } secondaryColor={ colors.N0 } /> } /> } margin='0 4px 0 0'>&nbsp;</IconWithLabel>
                    } />
              }
            </Field>
          </QueryColumn>
          <Column width='150px' margin='0 8px 0 0'>
            <Field name='host' label='Host'>
              {() => <Select options={ hostOptions } value={ hostOptions.find(item => item.value === host) } onChange={ (item) => item && setHost(item.value) } /> }
            </Field>
          </Column>
          <Column width='150px' margin='0 8px 0 0'>
            <Field name='payment' label='Payment model'>
              {() => <Select options={ paymentOptions } value={ paymentOptions.find(item => item.value === payment) } onChange={ (item) => item && setPayment(item.value) } /> }
            </Field>
          </Column>
          <Column width='150px' margin='0 8px 0 0'>
            <Field name='hosting' label='Hosting'>
              {() => <Select options={ hostingOptions } value={ hostingOptions.find(item => item.value === hosting) } onChange={ (item) => item && setHosting(item.value) } /> }
            </Field>
          </Column>
          <Column stretched></Column>
          <Column align='end'>
          { isLoading
              ? <Spinner />
              : totalApps !== totalSearchResults
                ? <>{totalSearchResults} of {totalApps} Connect apps listed</>
                : <>{totalApps} Connect apps listed</>
            }
          </Column>
        </Grid>
      </Row>
      <Row margin="12px 0">
        <DynamicTable
          head={ createHead() }
          rows={ createRows(apps) }
          isLoading={ isLoading || isFetching }
          sortKey={ sortKey }
          sortOrder={ sortOrder.toUpperCase() as 'ASC'|'DESC' }
          onSort={ ({ key, sortOrder}: { key: string, sortOrder: 'ASC'|'DESC' }) => {
            fetch(key, sortOrder.toLowerCase() as 'asc'|'desc');
          }}
          emptyView={ <span>There are no Connect apps available</span> }
          rowsPerPage={ undefined } />
      </Row>
      <Row align='center'>
        <Pagination 
          pages={ totalPages } 
          selectedIndex={ selectedPage ? selectedPage - 1 : 0 } 
          getPageLabel={ (item) => item.toString() } 
          onChange={ (_event: SyntheticEvent<unknown, Event>, page: number) => setSelectedPage(page) } />
      </Row>
    </Grid>
  );
}