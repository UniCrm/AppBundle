<?php

namespace UniCrm\Bundles\AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class DefaultController extends Controller
{
    /**
     * @Route("/" , name="homepage")
     */
    public function indexAction( Request $request )
    {
        $request = $this->get('request_stack')->getMasterRequest();

        $redirectUri = $this->generateUrl('homepage',[] ,UrlGeneratorInterface::ABSOLUTE_URL);

        $googleCalendar = $this->get('fungio.google_calendar');

        $googleCalendar->setRedirectUri($redirectUri);

        if ($request->query->has('code') && $request->get('code')) {
            $client = $googleCalendar->getClient($request->get('code'));
        } else {
            $client = $googleCalendar->getClient();
        }

        if (is_string($client)) {
            return new RedirectResponse($client);
        }

        $events = $googleCalendar->getEventsForDate('primary', new \DateTime('now'));

        die($events);

        return $this->render('@UniCrmApp/dashboard/index.html.twig');
    }

    /**
     * @Route("/dashboard" , name="homepage2")
     */
    public function dashboardAction()
    {

        return $this->render('@UniCrmApp/dashboard/index.html.twig');
    }
}
