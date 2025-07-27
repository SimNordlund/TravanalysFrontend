// RealNavbar.jsx
import { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useNavigate, NavLink } from 'react-router-dom'; // Changed!
import travhorsi from './Bilder/travhorsi2.png';

const navigation = [
  { name: 'Startsida', to: '/' }, // Changed!
  { name: 'Analys', to: '/ChartPage/analys' }, // Changed!
  { name: 'Tabell', to: '/ChartPage/tabell' }, // Changed!
  { name: 'Speltips', to: '/ChartPage/speltips' }, // Changed!
  { name: 'Vad är Travanalys?', to: '/Components/SkrytComponent' }, // Changed!
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  const navigateNavBar = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigateNavBar('/signin');
  };

  return (
    <Disclosure as="nav" className="bg-gray-800 sticky top-0 z-50">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-1">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobil */}
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <img className="h-10 w-auto" src={travhorsi} alt="Travanalys" />
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-1">
                    {navigation.map((item) => (
                      <NavLink // Changed!
                        key={item.name}
                        to={item.to} // Changed!
                        className={({ isActive }) =>
                          classNames(
                            isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', // Changed!
                            'rounded-md px-3 py-2 text-sm font-medium'
                          )
                        }
                        end={item.to === '/'} // Changed! exakt match på startsidan
                        aria-current={({ isActive }) => (isActive ? 'page' : undefined)} // Changed!
                      >
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <div>
                  <NavLink to="/" className="mt-0 font-semibold text-lg sm:text-xl text-white"> {/* Changed! */}
                    Travanalys
                  </NavLink>
                </div>

                <Menu as="div" className="relative ml-3">
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                          >
                            Din profil
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                          >
                            Inställningar
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={classNames(active ? 'bg-gray-100' : '', 'block w-full text-left px-4 py-2 text-sm text-gray-700')}
                          >
                            Logga ut
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>

          {/* Mobilmeny */}
          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={NavLink} // Changed!
                  to={item.to} // Changed!
                  className={({ isActive }) =>
                    classNames(
                      isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', // Changed!
                      'block rounded-md px-3 py-2 text-base font-medium'
                    )
                  }
                  end={item.to === '/'} // Changed!
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
