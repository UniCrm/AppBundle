<?php

namespace UniCrm\Bundles\AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use UniCrm\Bundles\AppBundle\Entity\User;
use UniCrm\Bundles\AppBundle\Form\Type\Users\UserFormType;
use UniCrm\Bundles\AppBundle\Util\Util;


/**
 * Class UsersController
 * @package UniCrm\Bundles\AppBundle\Controller
 * @Route("/users" , name="users.")
 */
class UsersController extends Controller
{
    protected $title = 'Users';

    /**
     * @Route("/" , name="index")
     * @Method("GET")
     */
    public function indexAction(Request $request){

        return $this->render('@UniCrmApp/users/index.html.twig' , [
            'title' => $this->title,
            'panel_title' => $this->title,
            'quick_create' => [
                'url' => $this->generateUrl('users.create'),
                'title' => 'Create User',
            ],
            'datatable' => [
                'source' => $this->generateUrl('users.datatable'),
                'columns'=> [
                    [ 'title' =>  'Id' ],
                    [ 'title' =>  'Email' ],
                    [ 'title' =>  'Enabled','sortable' => false ],
                    [ 'title' =>  'Last Login' ],
                    [ 'title' =>  'Action' , 'sortable' => false ],
                ]
            ],
        ]);
    }

    /**
     * @Route("/datatable" , name="datatable")
     * @Method("POST")
     */
    public function datatableAction( Request $request ){

        $datatables = $this->get('datatables');

        try {
            $results = $datatables->handle($request, 'users');
            return $this->json($results);
        }
        catch (HttpException $e) {
            return $this->json($e->getMessage(), $e->getStatusCode());
        }
    }

    /**
     * @Route("/{user}/show")
     * @Method("GET")
     */
    public function showAction(){

    }

    /**
     * @Route("/create" , name="create")
     */
    public function storeAction(Request $request){

        $user = new User();
        $form = $this->createForm(UserFormType::class , $user);


        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
             $user = $form->getData();

            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($user);
            $entityManager->flush();

            return new JsonResponse([
                'success' => 'true'
            ]);
        }

        return $this->render('@UniCrmApp/users/create.html.twig',[
            'form' => $form->createView()
        ]);
    }

    /**
     * @Route("/{id}/edit" , defaults={"usre" = null})
     */
    public function editAction(User $user){
        dump($user);die;

    }

    /**
     * @Route("/{user}/delete")
     */
    public function deleteAction(){

    }




}
